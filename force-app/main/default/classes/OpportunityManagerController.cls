public with sharing class OpportunityManagerController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities() {    
        return [SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity];
    }
}