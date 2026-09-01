# language: pt
Funcionalidade: Gestão de Assinaturas do Clube da Barba & MRR
  Como dono da barbearia
  Quero oferecer planos de assinatura mensal com receita recorrente garantida
  Para estabilizar o fluxo de caixa (MRR) e engajar clientes com desconto

  Cenário: Cliente assinante utiliza 1 corte do seu saldo mensal
    Dado que o cliente "cust-1" possui um contrato ativo do plano "Clube da Barba Prime" com saldo de 2 cortes
    Quando o cliente consome 1 corte da assinatura
    Então o saldo restante de cortes deve ser 1
    E a mensalidade recorrente registrada deve ser R$ 69.90
