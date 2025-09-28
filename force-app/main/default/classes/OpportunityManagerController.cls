public with sharing class OpportunityManagerController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities() {    
        return [SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity];
    }

    @AuraEnabled
    public static Boolean markOpportunityClosed(Id opportunityId) {
        try {
            Opportunity opp = new Opportunity(Id = opportunityId, StageName = 'Closed Won');
            update opp;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao marcar Opportunity como Closed Won: ' + e.getMessage());
        }
    }
}