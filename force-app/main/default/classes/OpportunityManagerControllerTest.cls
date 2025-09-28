@isTest
private class OpportunityManagerControllerTest {
  // Test setup: cria dados usados pelos testes
  @testSetup
  static void setupData() {
    Account acct = new Account(Name = 'Conta Teste');
    insert acct;

    Opportunity opp = new Opportunity(
      Name = 'Opp Teste',
      AccountId = acct.Id,
      StageName = 'Prospecting',
      CloseDate = Date.today().addDays(30),
      Amount = 123.45
    );
    insert opp;
  }

  @isTest
  static void testGetOpportunities() {
    Test.startTest();
    List<Opportunity> opps = OpportunityManagerController.getOpportunities();
    Test.stopTest();

    // Deve retornar pelo menos a opportunity criada no @testSetup
    System.assertNotEquals(
      0,
      opps.size(),
      'A lista de opportunities não pode ser vazia'
    );

    // Verifica presença de campos selecionados (incluindo Account.Name)
    Opportunity anyOpp = opps[0];
    System.assertNotEquals(null, anyOpp.Id, 'Id não deve ser nulo');
    System.assertNotEquals(null, anyOpp.Name, 'Name não deve ser nulo');
    System.assertNotEquals(
      null,
      anyOpp.StageName,
      'StageName não deve ser nulo'
    );
    System.assertNotEquals(
      null,
      anyOpp.Account,
      'Account relationship deve estar populada'
    );
    System.assertNotEquals(
      null,
      anyOpp.Account.Name,
      'Account.Name deve estar populado'
    );
  }

  @isTest
  static void testMarkOpportunityClosedSuccess() {
    // Recupera a opportunity criada no @testSetup
    Opportunity existingOpp = [SELECT Id, StageName FROM Opportunity LIMIT 1];

    Test.startTest();
    Boolean result = OpportunityManagerController.markOpportunityClosed(
      existingOpp.Id
    );
    Test.stopTest();

    System.assertEquals(
      true,
      result,
      'O método deve retornar true quando sucesso'
    );

    Opportunity updated = [
      SELECT Id, StageName
      FROM Opportunity
      WHERE Id = :existingOpp.Id
    ];
    System.assertEquals(
      'Closed Won',
      updated.StageName,
      'StageName deve ser atualizado para Closed Won'
    );
  }

  @isTest
  static void testMarkOpportunityClosedExceptionPath() {
    Boolean caught = false;
    Id fakeId = Id.valueOf('006000000000000AAA');
    Test.startTest();
    try {
      OpportunityManagerController.markOpportunityClosed(fakeId);
    } catch (AuraHandledException e) {
      caught = true;
    }
    Test.stopTest();
    System.assertEquals(
      true,
      caught,
      'Deve ter sido lançada uma AuraHandledException'
    );
  }
}
