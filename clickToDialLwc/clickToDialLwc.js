import { LightningElement, api, wire } from 'lwc';
import userId from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';

// import avayaCampaignId from '@salesforce/schema/User.Avaya_Campaign_ID__c';
// import avayaSkillId from '@salesforce/schema/User.Avaya_Skill_Id__c';


const FIELDS = [
    'Lead.Alternate_Phone_Number_Masked__c',
    'Lead.MaskedMobile__c',
    'Lead.OwnerId',  
];

export default class ClickToDailLwc extends LightningElement {
    @api recordId;
    alternatePhoneMasked;
    maskedMobile;
    ownerId;
    //currentUserId;
    // blankSkillIdCampaignId;
    userNotOwner;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    lead({error,data}){
        if(data){
            //this.currentUserId = userId;
            this.ownerId = data.fields.OwnerId.value;
            this.alternatePhoneMasked = data.fields.Alternate_Phone_Number_Masked__c.value;
            this.maskedMobile = data.fields.MaskedMobile__c.value;
            if(userId != this.ownerId){
                this.userNotOwner = true;
            }
        }
        else if(error){
            console.log('Error');
        }
    }

    // @wire(getRecord, { recordId: userId, fields: [avayaSkillId, avayaCampaignId] })
    // currentUserInfo({ error, data }) {
    //     if (data) {
    //         if(!data.fields.Avaya_Skill_Id__c.value || !data.fields.Avaya_Campaign_ID__c.value){
    //              this.blankSkillIdCampaignId = true; 
    //         }
    //     }else if (error) {
    //         this.error = error;
    //     }
    //     else{
    //         console.log('Data not Present')
    //     }
    // }
}