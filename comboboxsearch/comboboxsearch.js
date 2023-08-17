import { LightningElement, api } from "lwc";

export default class Comboboxsearch extends LightningElement {
    @api options;
    @api label;
    @api isInputDisabled = false;
    searchResults;
    selectedSearchResult;
    searchTimeout;
    @api isSelectedValue = false;
    
    get selectedValue() {
        return (this.isInputDisabled == false && this.selectedSearchResult)
            ? this.selectedSearchResult.label
            : null;
    }

    renderedCallback(){
        if(this.isInputDisabled == true){
            this.selectedSearchResult = null;
        }
    }

    get comboElement(){
        return this.template.querySelector(".slds-combobox-container");
    }

    connectedCallback() {
        document.addEventListener("keyup", this.handleEscapeKey.bind(this));
        document.addEventListener("click", this.handleOutsideClick.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener("keyup", this.handleEscapeKey);
        document.removeEventListener("click", this.handleOutsideClick);
    }

    handleEscapeKey(event) {
        if (event.key === "Escape") {
            this.clearSearchResults();
            this.template.querySelector(".slds-combobox-input").blur();
        }
    }

    handleOutsideClick(event){
        if(!event.path.includes(this.comboElement)){
            this.clearSearchResults();
        }
    }

    handleBlur(event){
        const input = event.target.value;

        if(!input){
            this.dispatchEvent(
                new CustomEvent("optionselected", {
                    detail: {
                        selectedValue: null,
                        selectedLabel: this.label
                    }
                })
            );

            return;
        }

        const result = this.options.find((picklistOption) =>
            picklistOption.label.toLowerCase() == input.toString().toLowerCase()
        );

        if(result === undefined || result.length == 0){
            this.dispatchEvent(
                new CustomEvent("optionselected", {
                    detail: {
                        selectedValue: null,
                        selectedLabel: this.label
                    }
                })
            );
        } else {
            this.dispatchEvent(
                new CustomEvent("optionselected", {
                    detail: {
                        selectedValue: result.value,
                        selectedLabel: this.label
                    }
                })
            );
        }
    }

    searchCombobox(event) {
        clearTimeout(this.searchTimeout);

        const input = event.detail.value.toLowerCase();

        this.searchTimeout = setTimeout(() => {
            const result = this.options.filter((picklistOption) =>
                picklistOption.label.toLowerCase().includes(input)
            );
            this.searchResults = result;
        }, 400);
    }

    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;

        this.selectedSearchResult = this.options.find(
            (picklistOption) => picklistOption.value === selectedValue
        );

        this.clearSearchResults();

        const selectedEvent = new CustomEvent('optionselected', {
            detail: {
                selectedValue: this.selectedSearchResult.value,
                selectedLabel: this.label
            },
            bubbles: true
        });
        this.dispatchEvent(selectedEvent);
    }
    
    clearSearchResults() {
        this.searchResults = null;
    }

    showPicklistOptions() {
        if (!this.searchResults) {
            this.searchResults = this.options;
        }
    }
}