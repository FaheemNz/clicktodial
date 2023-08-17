import { LightningElement, wire, track, api } from 'lwc';
import getUserList from '@salesforce/apex/userAvailabilityScreen.getUserList';
import updateUsers from '@salesforce/apex/userAvailabilityScreen.updateUsers';
import getProfile from  '@salesforce/apex/userAvailabilityScreen.getProfile';
import updateUsersForWork from '@salesforce/apex/userAvailabilityScreen.updateUsersForWork';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class userAvailabilityScreen extends LightningElement {


    @track allUsers;
    @track error;

    @track
    options = [];
    options2 = [];
    @track
    values = [];
    values2 =[];

    allOptions = [];
    allOptions2 = [];
    selectedOptionsList = [];
    selectedOptionsList2 = [];
    getValue = '';

    @api isLoaded = false;
    
    @wire(getUserList) 
    getUserList({ error, data }) {
      
        if (data) {
            const items = [];
            const itemsSelected = [];
            this.options = Object.keys(data).map(key => ({ label: data[key].UserName, value: data[key].userId }));
          
          this.isLoaded = true;
        for (var key in data) {
            this.allOptions.push(data[key].userId);
            console.log('allOption - > ' + this.allOptions);
            if(data[key].Selected){
                this.values.push(data[key].userId);
                console.log('vaule' + this.values);
            }
        }
       
        } else if (error) {
            this.isLoaded = true;
            alert('error');
            console.log(error);
            this.error = error;
        }
    }
    
    handleUpdate(event) {
      
       this.isLoaded = false;

        updateUsers({userIds: this.selectedOptionsList , allUserIds: this.allOptions})
      .then(result => { 
        console.log('SelectOptionList + allOption' + this.selectedOptionsList, this.allOptions)
        this.isLoaded = true;

        const event = new ShowToastEvent({
            title: 'Success',
            message: 'Successfully updated the user list..!',
        });
        this.dispatchEvent(event);  
        location.reload();

      })
      .catch(error => { 
        this.isLoaded = true;
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Some error occured please contact your system admin..!',
        });
        this.dispatchEvent(event);  
        location.reload();
       })


        }


    handleChange(event) {
        this.selectedOptionsList = event.detail.value;
        
    }

    @wire(getProfile) 
    getProfile({ error, data }) {
      
        if (data) {
            const items = [];
            const itemsSelected = [];
            this.options2 = Object.keys(data).map(key => ({ label: data[key].UserName, value: data[key].userId }));
          this.isLoaded = true;
        for (var key in data) {
            this.allOptions2.push(data[key].userId);
            console.log('allOption2 ' + this.allOptions2);
            this.getValue = data[key].isRegionalSalesDirector;
            console.log('getVaule ' + this.getValue);

            if(data[key].Selected){
                this.values2.push(data[key].userId);
                console.log('vau2 ' + this.values2);
            }
        }
       
        } else if (error) {
            this.isLoaded = true;
            alert('error');
            console.log(error);
            this.error = error;
        }
    }
    handleUpdateAvailForWork(event) {
        this.isLoaded = false;
 
        updateUsersForWork({workUserIds: this.selectedOptionsList2, allWorkUserIds: this.allOptions2})
       .then(result => { 

        location.reload();
         const event = new ShowToastEvent({
             title: 'Success', 
             variant: 'success',
             message: 'Successfully updated the user list..!',
         });
         this.dispatchEvent(event);  
       })
       .catch(error => { 
         this.isLoaded = true;
         const event = new ShowToastEvent({
             title: 'Error',
             variant: 'error',
             message: 'Some error occured please contact your system admin..!',
         });
         this.dispatchEvent(event);  
         location.reload();
        })
 
 
         }
 
 
     handleChangeAvailWork(event) {
         this.selectedOptionsList2 = event.detail.value;
         console.log('selectedOptionsList2' + this.selectedOptionsList2);
         
     }
   
}