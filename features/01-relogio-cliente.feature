# language: pt
Funcionalidade: Motor de Relógio de Frequência do Cliente (Clock Engine)
  Como dono da barbearia
  Quero acompanhar o relógio de frequência de corte de cada cliente em 5 estados
  Para reter clientes e prever o risco de churn invisível antes de perdê-los

  Cenário: Cliente retorna no prazo e permanece Em Dia
    Dado que o cliente "Carlos Andrade" possui um intervalo médio de 20 dias
    E o tempo decorrido desde o último corte é de 10 dias
    Quando o relógio de frequência calcula o status do cliente
    Então o status retornado deve ser "EM_DIA"

  Cenário: Cliente entra na Janela Ótima de Agendamento
    Dado que o cliente "Carlos Andrade" possui um intervalo médio de 20 dias
    E o tempo decorrido desde o último corte é de 20 dias
    Quando o relógio de frequência calcula o status do cliente
    Então o status retornado deve ser "NA_JANELA"

  Cenário: Cliente ultrapassa a Janela Ótima e entra em Risco de Churn
    Dado que o cliente "Carlos Andrade" possui um intervalo médio de 20 dias
    E o tempo decorrido desde o último corte é de 28 dias
    Quando o relógio de frequência calcula o status do cliente
    Então o status retornado deve ser "EM_RISCO"
