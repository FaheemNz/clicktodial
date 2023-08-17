import { LightningElement, api } from 'lwc';
import getLeadOptions from '@salesforce/apex/Lead2Controller.getLeadOptions';
import saveFormData from '@salesforce/apex/Lead2Controller.saveFormData';
import sendErrorEmail from "@salesforce/apex/Lead2Controller.sendErrorEmail";
import { loadScript } from 'lightning/platformResourceLoader';
import KioskPhoneLibrary from '@salesforce/resourceUrl/KioskPhoneLibrary';

export default class ContactForm extends LightningElement {
    firstName;
    lastName;
    email;
    preferredProject;
    language;
    mobile;
    selectedLocationValue;
    notes;
    selectedDirectPcNameOptions;
    languageOptions;
    selectedLanguageValue;
    promoterOptions;
    selectedPromoterValue;
    nationalityOptions;
    selectedNationalityValue;
    countryOfResidenceOptions;
    selectedCountryOfResidenceValue;
    selectedMobileCountryCode;
    mobileCountryCodeOptions;
    locationOptions;
    selectedAlternateMobileCountryCode;
    tableMeetingOptions;
    selectedTableMeetingOption;
    directOfficeVisitorOptions;
    selectedDirectOfficeVisitorOption;
    alternateMobile;
    hotel;
    room;
    isLoading = false;
    isLocationSelected = true;
    isLeadCreated = false;
    isLibraryLoaded = false;
    formErrors = [];

    @api isHide = false;

    renderedCallback(){
        if(!this.isLibraryLoaded){
            loadScript(this, KioskPhoneLibrary)
                .then(response => {
                    this.isLibraryLoaded = true;
                    console.log("Phone Validation Loaded");
                })
                .catch(error => {
                    console.log("Phone Validation Error");
                    console.log(error);
                });
        }
    }

    handleNOPC(event){
        if(event.target.checked == true){
            this.isDisabled = true;
            this.isHide = true;
            this.selectedDirectPcNameOptions = null;
        }else{
            this.isDisabled = false;
            this.isHide = false;
        }
    }

    @api isDisabled = false;
 
    connectedCallback(){
        this.isLoading = true;

        getLeadOptions()
            .then(response => {
                this.directPcNameOptions = response.directPcNames;
                this.languageOptions = response.languages;
                this.countryOfResidenceOptions = response.countriesOfResidence;
                this.nationalityOptions = response.nationalities;
                this.locationOptions = response.locations;
                this.mobileCountryCodeOptions = response.mobileCountryCodes;
                this.promoterOptions = response.promoters;
                this.tableMeetingOptions = [
                    { label: "Yes", value: "Yes" },
                    { label: "-", value: "-" }
                ];
                this.directOfficeVisitorOptions = [
                    { label: "Yes", value: "Yes" },
                    { label: "-", value: "-" }
                ];

                this.isLoading = false;
                if(Boolean(this.directPcNameOptions) && this.directPcNameOptions.length > 0){
                    this.isHide = false;
                }else{
                    this.isHide = true;
                }
            })
            .catch(error => {
                console.log(error);
                this.sendError("Some Error Occured in connectedCallBack. Error: " + error);
                this.isLoading = false;
            });
    }

    handleOptionSelected(event){
        const selectedValue = event.detail.selectedValue;
        const selectedLabel = event.detail.selectedLabel;
        
        if(selectedLabel == "Country Code"){
            this.selectedMobileCountryCode = selectedValue;
        } else if(selectedLabel == "Alternate Country Code"){
            this.selectedAlternateMobileCountryCode = selectedValue;
        } else if(selectedLabel == "Nationality"){
            this.selectedNationalityValue = selectedValue;
        } else if(selectedLabel == "Country of Residence"){
            this.selectedCountryOfResidenceValue = selectedValue;
        } else if(selectedLabel == "Direct PC Name" && this.isDisabled == false){
            this.selectedDirectPcNameOptions = selectedValue;
        } else if(selectedLabel == "Promoter Name"){
            this.selectedPromoterValue = selectedValue;
        } else if(selectedLabel == "Language"){
            this.selectedLanguageValue = selectedValue;
        }
    }

    handleInputChange(event){
        const field = event.target.name;
        const value = event.target.value;
        this[field] = value;
    }

    handleSelectChange(event){
        const field = event.target.name;
        const value = event.detail.value;
        this[field] = value;   
    }
    
    handleMobileBlurChange(event){
        let isValid = null,
            errorMessage = "";
        
        if(event.target.name == 'mobile'){
            if(this.selectedMobileCountryCode && this.isValidMobileFormat(this.mobile) ){
                isValid = this.validateMobileNumber(this.selectedMobileCountryCode, this.mobile);
                errorMessage = "Please provide the Mobile Number in a valid Format";
            }
        } else if(event.target.name == 'alternateMobile'){
            if(this.selectedAlternateMobileCountryCode && this.isValidMobileFormat(this.alternateMobile) ){
                isValid = this.validateMobileNumber(this.selectedAlternateMobileCountryCode, this.alternateMobile);
                errorMessage = "Please provide the Alternate Mobile Number in a valid Format";
            }
        }
        
        event.target.setCustomValidity( isValid === false ? errorMessage : "" );
        event.target.reportValidity();
    }
    
    reloadPage(){
        window.location.reload(true);
    }

    get cssLocationClass(){
        return this.selectedLocationValue
            ? 'slds-theme_inverse isRounded'
            : '';
    }

    handleFormSubmit(event) {
        event.preventDefault();

        let errors = this.getErrors();

        if(errors.length){
            this.formErrors = errors;

            return;
        }

        this.formErrors = [];

        let formData = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            mobileCountryCode: this.selectedMobileCountryCode,
            mobile: this.mobile,
            alternateMobile: this.alternateMobile,
            alternateMobileCountryCode: this.selectedAlternateMobileCountryCode,
            preferredProject: this.preferredProject,
            promoterName: this.selectedPromoterValue,
            notes: this.notes,
            language: this.selectedLanguageValue,
            nationality: this.selectedNationalityValue,
            countryOfResidence: this.selectedCountryOfResidenceValue,
            //directPcName: this.selectedDirectPcNameOptions,
            location: this.selectedLocationValue,
            tableMeeting: this.selectedTableMeetingOption,
            hotel: this.hotel,
            room: this.room,
            directOfficeVisitor: this.selectedDirectOfficeVisitorOption
        };

        if(Boolean(this.selectedDirectPcNameOptions)){
            formData.directPcName = this.selectedDirectPcNameOptions;
        }

        this.isLoading = true;

        saveFormData({formData})
            .then(response => {
                console.log(response);

                this.isLoading = false;

                if(response == true){
                    this.isLeadCreated = true;
                } else {
                    this.sendError("saveFormData returned false. FormData: " + JSON.stringify(formData));
                }
            })
            .catch(error => {
                this.sendError("saveFormData Exception; FormData: " + JSON.stringify(formData) + ", error: " + JSON.stringify(error));

                console.log(error);

                this.isLoading = false;
            });
    }

    getErrors(){
        let errors = [];

        if(!this.selectedLocationValue) errors.push("Please choose Location");
        if(!this.firstName) errors.push("Please enter First Name");
        if(!this.lastName) errors.push("Please enter Last Name");
        if(this.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/.test(this.email)) errors.push("Please provide a valid Email");
        if(!this.selectedMobileCountryCode) errors.push("Please select a Country Code");
        if(!this.isValidMobileFormat(this.mobile) ) errors.push("Please enter a valid Mobile Number");
        if( this.selectedMobileCountryCode && this.isValidMobileFormat(this.mobile) ){
            let isValid = this.validateMobileNumber(this.selectedMobileCountryCode, this.mobile);
            
            if(isValid === false){
                errors.push("Please provide the Mobile Number in a valid Format");
            }
        }
        if(this.selectedAlternateMobileCountryCode && !this.isValidMobileFormat(this.alternateMobile)) errors.push("Please enter a valid Alternate Mobile Number");
        if(this.isValidMobileFormat(this.alternateMobile) && !this.selectedAlternateMobileCountryCode) errors.push("Please choose an Alternate Mobile Country Code");
        if( this.selectedAlternateMobileCountryCode && this.isValidMobileFormat(this.alternateMobile) ){
            let isValid = this.validateMobileNumber(this.selectedAlternateMobileCountryCode, this.alternateMobile);

            if(isValid === false){
                errors.push("Please provide the Alternate Mobile Number in a valid Format");
            }
        }
        if(!this.preferredProject) errors.push("Please provide Preferred Project");
        if(!this.notes) errors.push("Please complete the Notes");
        if(!this.selectedPromoterValue) errors.push("Please choose the Promoter");
        if(!this.selectedLanguageValue) errors.push("Please choose a valid Language");
        if(!this.selectedNationalityValue) errors.push("Please choose a valid Nationality");
        if(!this.selectedCountryOfResidenceValue) errors.push("Please choose a valid Country of Residence");
        if(!this.isHide && !this.isDisabled && !this.selectedDirectPcNameOptions) errors.push("Please choose a Direct PC");
        if(!this.selectedTableMeetingOption) errors.push("Please choose Table Meeting Option");
        if(!this.selectedDirectOfficeVisitorOption) errors.push("Please choose Direct Office Visitor Option");
        
        return errors;
    }

    validateMobileNumber(countryCode, mobileNumber){
        const phoneNumberUtil = window.libphonenumber;
            
        countryCode = countryCode.replace(/\D/g, '');

        let parsedNumber = phoneNumberUtil.parsePhoneNumber( "+" + countryCode + "" + mobileNumber );
        
        return !parsedNumber.isValid() 
            ? false 
            : true;
    }

    isValidMobileFormat(number){
        return /^[0-9]{1,17}$/.test(number);
    }

    async sendError(message){
        await sendErrorEmail({message});
        
        alert("Some Error Occured. Please try again Later");
    }
}