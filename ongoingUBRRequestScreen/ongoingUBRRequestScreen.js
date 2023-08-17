import { LightningElement, api, track, wire } from 'lwc';
import getAllOngoingUBRRequest from '@salesforce/apex/ShowOngoingUBRRequest.getAllOngoingUBRRequest';

const columns = [ 
    { label: 'Building Name', fieldName: 'buildingNameLink', type:'url', typeAttributes: { label: { fieldName: 'builingName' }, target: '_blank' } }, 
    { label: 'Unit Number', fieldName: 'unitNumber' }, 
    { label: 'Blocked By', fieldName: 'blockedBy' }
];

export default class OngoingUBRRequestScreen extends LightningElement {
columns = columns;
@track ubrRequests = [];

    @wire(getAllOngoingUBRRequest) 
    ongoingUbrRequest ({ error, data }) {
        if (data) {
            data = JSON.parse(JSON.stringify(data));
            data.forEach(res => {
                res.buildingNameLink = '/' + res.recordId;
            });
            this.ubrRequests = data;
            this.error = undefined;
       } else if (error) { 
           this.error = error;  
      }   }
}