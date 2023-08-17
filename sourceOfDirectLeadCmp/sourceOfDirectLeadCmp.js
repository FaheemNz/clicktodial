import { LightningElement, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi'; //this scoped module get the record details 
import Id from '@salesforce/user/Id'; //this scoped module imports the current user ID 
import ProfileName from '@salesforce/schema/User.Profile.Name'; //this scoped module imports the current user profile name
import DirectPC from '@salesforce/schema/User.Team__c'; //this scoped module imports the current user profile name 
import DIRECT_LEAD_SOURCE from '@salesforce/schema/User.Direct_Lead_Source__c'; 
import AVAILABLE_FOR_WORK from '@salesforce/schema/User.Available_For_Work__c';
import USER_ID from '@salesforce/schema/User.Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class ToggleButton extends LightningElement {
    @track userProfileName;
    @track DirectPC = false;
    @track directLeadSource;
    @track isButtonOn = false;
    @track isLoading = false;
    @track kioskValue;
    @track teleSalesValue;

    get IsPCLoggedIn(){
        return this.DirectPC == 'Direct' && (this.userProfileName == 'System Administrator' || this.userProfileName == 'Property Consultant' || this.userProfileName == 'System Administrator' || this.userProfileName == 'Property Consultant - Internal');
    }

    @wire(getRecord, { recordId: Id, fields: [ProfileName, DirectPC, DIRECT_LEAD_SOURCE, AVAILABLE_FOR_WORK] })
    userDetails({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            if (data.fields.Profile.value != null) {
                this.userProfileName = data.fields.Profile.value.fields.Name.value;
                console.log('UserProfileName ::: ',this.userProfileName);
            }
            if (data.fields.Team__c.value != null) {
                this.DirectPC = data.fields.Team__c.value;
                console.log('DirectPC ::: ',this.DirectPC);
            }
            if (data.fields.Direct_Lead_Source__c.value != null) {
                this.directLeadSource = data.fields.Direct_Lead_Source__c.value;
                this.kioskValue = data.fields.Direct_Lead_Source__c.value;
            }
            if (data.fields.Available_For_Work__c.value != null) {
                this.teleSalesValue = data.fields.Available_For_Work__c.value;
            }
        }
    }

    get buttonClass() {
        return this.isButtonOn ? 'button-on' : 'button-off';
    }

    get label() {
        return this.isButtonOn ? 'TeleSales' : 'Kiosk';
    }

    toggleButton(event) {
        event.preventDefault();
        this.isLoading = true;
        const fields = {};
        fields[USER_ID.fieldApiName] = Id;
        if(event.target.name == 'kiosk'){
            if(event.target.checked == true){
                fields[DIRECT_LEAD_SOURCE.fieldApiName] = true;
                //fields[AVAILABLE_FOR_WORK.fieldApiName] = false;
            }else{
                fields[DIRECT_LEAD_SOURCE.fieldApiName] = false;
            }
            this.kioskValue = fields[DIRECT_LEAD_SOURCE.fieldApiName];
        }else if(event.target.name == 'telesales'){
            if(event.target.checked == true){
                //fields[DIRECT_LEAD_SOURCE.fieldApiName] = false;
                fields[AVAILABLE_FOR_WORK.fieldApiName] = true;
            }else{
                fields[AVAILABLE_FOR_WORK.fieldApiName] = false;
            }
            this.teleSalesValue = fields[AVAILABLE_FOR_WORK.fieldApiName];
        }

        const recordInput = {
            fields: fields
          };
          
        updateRecord(recordInput) .then(() => {
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record updated',
                variant: 'success'
            })
        );
        }) .catch(error => {
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}