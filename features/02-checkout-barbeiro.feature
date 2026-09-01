# language: pt
Funcionalidade: Ficha Técnica & Checkout de Balcão do Barbeiro em 20 Segundos
  Como barbeiro do estabelecimento
  Quero registrar o atendimento do cliente com fotos e detalhes técnicos em 20 segundos
  Para zerar o relógio de frequência e calcular a comissão de 50%

  Cenário: Realizar atendimento do cliente com cálculo de comissão de 50%
    Dado que o cliente "cust-1" realizou um corte de R$ 70.00 com o barbeiro "barber-rafael"
    E a Ficha Técnica especifica altura de pente "2 nas laterais" e tesoura "no topo"
    Quando o barbeiro finaliza o checkout de balcão
    Então o valor total cobrado deve ser R$ 70.00
    E a comissão do barbeiro calculada deve ser R$ 35.00
    E o relógio do cliente deve ser zerado para 0 dias
