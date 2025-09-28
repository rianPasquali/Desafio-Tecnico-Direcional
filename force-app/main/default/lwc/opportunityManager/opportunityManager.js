import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunities from '@salesforce/apex/OpportunityManagerController.getOpportunities';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true, wrapText: true },
    { label: 'Stage', fieldName: 'StageName', type: 'text', sortable: true },
    { label: 'Amount', fieldName: 'Amount', type: 'currency', sortable: true },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date', sortable: true },
    { type: 'button', initialWidth: 150, typeAttributes: { label: 'Ver Detalhes', name: 'view_details', title: 'Ver Detalhes' } }
];

export default class OpportunityManager extends NavigationMixin(LightningElement) {
    @track opps = [];
    // Mantém o conjunto original para aplicar filtros sem perder os dados brutos
    originalOpps = [];
    columns = COLUMNS;
    error;
    // Campo de filtro para o nome da Conta
    accountFilter = '';
    // Debounce para evitar múltiplas execuções rápidas ao digitar
    debounceTimeout;

    @wire(getOpportunities)
    listOpps({ error, data }) {
        if (data) {
            // Guarda original e fornece a lista inicial
            this.originalOpps = data;
            this.opps = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.opps = [];
            this.originalOpps = [];
        }
    }

    handleAccountFilterInput(event) {
        // Atualiza o valor do filtro e aplica debounce para filtrar
        this.accountFilter = event.target.value || '';

        // Limpa timeout anterior
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Debounce de 300ms (ajustável)
        this.debounceTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    applyFilters() {
        const filterValue = this.accountFilter.trim().toLowerCase();

        if (!filterValue) {
            // Sem filtro restaura a lista original
            this.opps = [...this.originalOpps];
            return;
        }

        // Filtra usando Account.Name
        const filtered = this.originalOpps.filter((o) => {
            const accName = o.Account && o.Account.Name ? String(o.Account.Name).toLowerCase() : '';
            return accName.includes(filterValue);
        });
        this.opps = filtered;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_details') {
        // Navega para a página de registro da Opportunity
        this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Opportunity',
                    actionName: 'view'
                }
            });
        }
    }
}