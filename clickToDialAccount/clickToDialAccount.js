import { LightningElement, api, wire } from 'lwc';
import feedback from '@salesforce/apex/CustomerFeedback.feedbackSave';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Account.Mobile_Number_Formula__c',
    'Account.Alternate_Phone_Number__c',
];

export default class ClickToDialAccount extends LightningElement {
    @api recordId;
    userId = '';
    isFeedbackVisible = false;
    feedbackInput = '';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    account;

    get mobileNumber() {
        return this.account.data.fields.Mobile_Number_Formula__c.value;
    }
    get alternateMobile() {
        return this.account.data.fields.Alternate_Phone_Number__c.value;
    }

    getFeedback() {
        console.log('on action');
        this.isFeedbackVisible = true;
    }

    handleFeedbackChange(e) {
        this.feedbackInput = e.currentTarget.value;
    }

    handleUserSelection(event) {
        this.userId = event.detail;
        console.log("the selected record id is" + event.detail);
    }

    closeModal() {
        this.isFeedbackVisible = false;
    }

    handleDialClick(event) {

        console.log('in handle dial click', event.currentTarget.value);
        const phoneNumber = event.currentTarget.value;
        if (phoneNumber != '' && phoneNumber != undefined) {
            this.isFeedbackVisible = true;

            if (sforce && sforce.one && sforce.one.clickToDial) {
                const dialParams = {
                    value: phoneNumber,
                    recordId: this.recordId
                };
                sforce.one.clickToDial(dialParams);
            } else {
                console.log('Click-to-dial is not available.');
            }
        } else {
            const evt = new ShowToastEvent({
                title: 'Select Valid Phone Number',
                message: 'Click on field containing number',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        }
    }

    handleSave() {
        if (this.feedbackInput != '') {
            feedback({ accountId: this.recordId, userId: this.userId, note: this.feedbackInput })
                .then(result => {
                    if (result == true) {
                        this.isFeedbackVisible = false;
                        const evt = new ShowToastEvent({
                            title: 'Feedback Saved',
                            message: 'Operation sucessful',
                            variant: 'success',
                            mode: 'dismissable'
                        });
                        this.dispatchEvent(evt);
                    } else {
                        const evt = new ShowToastEvent({
                            title: 'Some unexpected error',
                            message: 'Contact Admin for further info',
                            variant: 'error',
                            mode: 'dismissable'
                        });
                        this.dispatchEvent(evt);
                    }
                })
                .catch(error => {
                    this.isFeedbackVisible = false;
                    const evt = new ShowToastEvent({
                        title: 'Some unexpected error',
                        message: error,
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                })
        } else {
            const evt = new ShowToastEvent({
                title: 'Please Fill Required Field',
                message: 'Feedback field is required',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        }
    }

}