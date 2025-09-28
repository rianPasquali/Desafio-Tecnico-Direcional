import { LightningElement, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getOpportunities from "@salesforce/apex/OpportunityManagerController.getOpportunities";
import markOpportunityClosed from "@salesforce/apex/OpportunityManagerController.markOpportunityClosed";

export default class OpportunityManager extends NavigationMixin(
  LightningElement
) {
  @track opps = [];
  // Mantém o conjunto original para aplicar filtros sem perder os dados brutos
  originalOpps = [];
  error;
  // Campo de filtro para o nome da Conta
  accountFilter = "";
  // Debounce para evitar múltiplas execuções rápidas ao digitar
  debounceTimeout;
  // Guarda o resultado do wire para refreshApex
  wiredOppsResult;
  loadingRows = new Set();

  get columns() {
    return [
      {
        label: "Name",
        fieldName: "Name",
        type: "text",
        sortable: true,
        wrapText: true
      },
      { label: "Stage", fieldName: "StageName", type: "text", sortable: true },
      {
        label: "Amount",
        fieldName: "Amount",
        type: "currency",
        sortable: true
      },
      {
        label: "Close Date",
        fieldName: "CloseDate",
        type: "date",
        sortable: true
      },
      {
        type: "button",
        initialWidth: 150,
        typeAttributes: {
          label: "Ver Detalhes",
          name: "view_details",
          title: "Ver Detalhes"
        }
      },
      {
        type: "button",
        initialWidth: 200,
        typeAttributes: {
          label: { fieldName: "closeButtonLabel" },
          name: "mark_closed",
          title: "Marcar como Fechada",
          disabled: { fieldName: "closeButtonDisabled" }
        }
      }
    ];
  }

  @wire(getOpportunities)
  listOpps(value) {
    // armazena o objeto de resultado para ser usado por refreshApex
    this.wiredOppsResult = value;
    const { error, data } = value;
    if (data) {
      // Guarda original e fornece a lista inicial
      this.originalOpps = data;
      this.opps = data;
      this.decorateRows();
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.opps = [];
      this.originalOpps = [];
    }
  }

  handleAccountFilterInput(event) {
    // Atualiza o valor do filtro e aplica debounce para filtrar
    this.accountFilter = event.target.value || "";

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
      this.decorateRows();
      return;
    }

    // Filtra usando Account.Name
    const filtered = this.originalOpps.filter((o) => {
      const accName =
        o.Account && o.Account.Name ? String(o.Account.Name).toLowerCase() : "";
      return accName.includes(filterValue);
    });
    this.opps = filtered;
    this.decorateRows();
  }

  decorateRows() {
    this.opps = this.opps.map((o) => {
      const isLoading = this.loadingRows.has(o.Id);
      const alreadyClosed = o.StageName === "Closed Won";
      return {
        ...o,
        closeButtonLabel: isLoading ? "Carregando..." : "Marcar como Fechada",
        closeButtonDisabled: isLoading || alreadyClosed
      };
    });
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if (actionName === "view_details") {
      // Navega para a página de registro da Opportunity
      this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attributes: {
          recordId: row.Id,
          objectApiName: "Opportunity",
          actionName: "view"
        }
      });
    }
    if (actionName === "mark_closed") {
      // Se já estiver fechada, apenas mostra uma mensagem
      if (row.StageName === "Closed Won") {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Info",
            message: "Oportunidade já está como Closed Won.",
            variant: "info"
          })
        );
        return;
      }

      this.loadingRows.add(row.Id);
      this.decorateRows();

      // Chama o Apex para atualizar o StageName
      markOpportunityClosed({ opportunityId: row.Id })
        .then(() => {
          // Atualiza a lista pedindo um refresh da wire
          return refreshApex(this.wiredOppsResult);
        })
        .then(() => {
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Sucesso",
              message: "Oportunidade marcada como Closed Won",
              variant: "success"
            })
          );
        })
        .catch((err) => {
          console.error(err);
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Erro",
              message:
                "Erro ao marcar Oportunidade: " +
                (err.body ? err.body.message : err.message),
              variant: "error"
            })
          );
        })
        .finally(() => {
          this.loadingRows.delete(row.Id);
          this.decorateRows();
        });
    }
  }
}
