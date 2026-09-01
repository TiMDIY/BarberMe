# 04: Motor de Automações & Disparos no WhatsApp (WhatsApp-First)

**What to build:**
Serviço de automação de fundo (Worker/Cron) que varre periodicamente a base de dados, detecta clientes em estado `NA_JANELA` e `EM_RISCO`, seleciona horários vagos no barbeiro preferido e gera disparos de WhatsApp com link de pré-reserva de 1 toque.

**Blocked by:**
- 02: Core Recurrence Engine & Algoritmo do Relógio do Cliente

**Status:** COMPLETED

- [x] Implementar serviço de varredura periódica de relógios (`NotificationScheduler`).
- [x] Criar gerador de links seguros de pré-reserva de 1 toque para o PWA do cliente.
- [x] Integrar provedor de envio de WhatsApp (Meta Cloud API / Baileys).
- [x] Implementar política de trava para evitar envios duplicados/inconvenientes.
- [x] Testar simulação de disparos para cohorts de clientes em diferentes estados.
