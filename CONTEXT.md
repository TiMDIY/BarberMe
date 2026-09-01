# BarberMe - Modelo de Domínio (Ubiquitous Language)

Motor de recorrência e retenção para barbearias baseado no ciclo biológico do cabelo ("Relógio do Cliente") e na padronização da experiência do atendimento ("Ficha Técnica do Corte").

---

## 1. Linguagem e Conceitos de Domínio

### Relógio do Cliente
**Definição:** O ciclo biológico individual de crescimento do cabelo/barba de cada cliente, medido em dias decorridos entre atendimentos. É o sensor central de cálculo de retenção.
_Evitar_: Frequência genérica, lembrete fixo, agendamento periódico.

### Estado do Cliente
**Definição:** A classificação dinâmica em tempo real do cliente com base no seu Relógio do Cliente (Em Dia, Na Janela, Em Risco, Dormente, Perdido).
_Evitar_: Status de cadastro, inativo/ativo genérico.

### Janela de Recompra
**Definição:** O intervalo ótimo (ex: +/- 3 dias do tempo médio do cliente) onde o convite de agendamento é disparado sem desconto, sugerindo barbeiro e horário pré-reservado.
_Evitar_: Promoção, disparo em massa, cupom.

### Ficha Técnica do Corte
**Definição:** O registro rápido (fotos padronizadas antes/depois, parâmetros de máquina por região, produtos aplicados e observações) realizado pelo barbeiro no fechamento da comanda.
_Evitar_: Histórico simples, observação da agenda.

### Plano de Assinatura (Membership)
**Definição:** O contrato mensal recorrente pré-pago pelo cliente que dá direito a atendimentos inclusos no mês, convertendo demanda esporádica em receita previsível.
_Evitar_: Pacote de cortes, fiado, carnê.

### Cold Start do Relógio
**Definição:** O algoritmo de estimativa inicial de ciclo aplicado a novos clientes sem histórico, calibrado por perfil/serviço e importação de histórico legado, convergindo para o ciclo real após 3 atendimentos.
_Evitar_: Falta de dados, ciclo padrão fixo.

---

## 2. Estados da Jornada do Cliente

| Estado | Condição em relação ao Intervalo Médio ($I_m$) | Ação Automática | Canal principal |
|---|---|---|---|
| **Em Dia** | $d < I_m - 3$ dias | Nenhuma (cliente em ciclo regular) | PWA (auto-serviço) |
| **Na Janela** | $I_m - 3 \le d \le I_m + 3$ dias | Convite de agendamento com horário sugerido (1 toque) | WhatsApp |
| **Em Risco** | $I_m + 3 < d \le I_m + 15$ dias | Oferta de Plano de Assinatura / Lembrete com urgência suave | WhatsApp |
| **Dormente** | $I_m + 15 < d \le I_m + 45$ dias | Reativação com oferta especial / mudança de barbeiro | WhatsApp |
| **Perdido (Churn)** | $d > I_m + 45$ dias | Interrupção de réguas ativas; reporte no cohort de evasão | Painel Web Dono |

---

## 3. Superfícies da Aplicação

### 1. Cliente (PWA + WhatsApp-First)
- **WhatsApp:** Canal de saída e confirmação (Lembrete 24h, Convite na Janela, Alerta de Risco).
- **PWA:** Interface sem download para consulta de Ficha Técnica, Histórico Visual, Assinatura e Confirmação de 1 toque.

### 2. Barbeiro (App Nativo Android / PWA Instalável)
- Ferramenta de balcão de uso contínuo (20x/dia).
- Fechamento de atendimento com Ficha Técnica (foto + parâmetros) em 20 segundos.
- Visualização de comissão acumulada em tempo real e preenchimento de horários vagos.

### 3. Administração / Dono (Painel Web)
- Monitoramento de Cohort de Evasão (quem parou de vir antes do churn definitivo).
- Gestão de Assinaturas e Receita Recorrente (MRR).
- Desempenho e taxa de ocupação das cadeiras sem expor a carteira para o barbeiro concorrer por fora.

### 4. Motor de Recorrência (Camada Autônoma sem Tela)
- Backend de monitoramento contínuo dos Relógios, agendamento de notificações segmentadas e precificação de planos baseada em cohorts.
