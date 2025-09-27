# Desafio-Tecnico-Direcional

## Teste Técnico – Salesforce Developer Sênior (Foco LWC)

### Desafio

Você deve criar um componente Lightning Web Component (LWC) chamado opportunityManager com os seguintes requisitos:

1. Listagem de Oportunidades

- Exibir uma lista de Opportunities em uma tabela.
- Campos obrigatórios: Name, StageName, Amount, CloseDate.
- Usar método Apex com @AuraEnabled(cacheable=true) e @wire no LWC.

2. Filtro Dinâmico

- Incluir um campo de entrada (lightning-input) para filtrar oportunidades pelo nome da
  Conta associada.
- O filtro deve atualizar a tabela em tempo real (sem refresh manual).

3. Navegação

- Adicionar botão “Ver Detalhes” que redirecione o usuário para a página da oportunidade no Salesforce.

4. Ação de Atualização (Opcional)

- Cada linha da tabela deve ter um botão “Marcar como Fechada” que:
- Atualize o StageName da oportunidade para Closed Won.
- Recarregue automaticamente a lista.

### O que será avaliado

- Estrutura: separação de HTML, JS e CSS; Apex bulk-safe; tratamento de erros com mensagens amigáveis.
- Git: commits pequenos e frequentes, mensagens padronizadas (feat, fix, test)
- Testes: cobertura mínima de 80%, uso de mocks de Apex, validação de renderização, filtro, navegação e atualização.
- Qualidade: linting ativo, ausência de duplicação de código, indentação
