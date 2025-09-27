import { LightningElement, wire, track } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityManagerController.getOpportunities';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true, wrapText: true },
    { label: 'Stage', fieldName: 'StageName', type: 'text', sortable: true },
    { label: 'Amount', fieldName: 'Amount', type: 'currency', sortable: true },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date', sortable: true }
];

export default class OpportunityManager extends LightningElement {
    @track opps = [];
    columns = COLUMNS;
    error;

    @wire(getOpportunities)
    listOpps({ error, data }) {
        if (data) {
            this.opps = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.opps = [];
        }
    }
}