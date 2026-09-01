# 03: Ficha Técnica do Corte & Fluxo de Balcão do Barbeiro

**What to build:**
API e interface de balcão para o barbeiro fechar comandas em 20 segundos. Permite registrar foto (antes/depois), pentes de máquina por região, produtos aplicados e observações do corte. O fechamento credita a comissão do barbeiro em tempo real e reinicia o Relógio do Cliente para 0 dias.

**Blocked by:**
- 01: Setup da Infraestrutura & Modelagem de Dados Base
- 02: Core Recurrence Engine & Algoritmo do Relógio do Cliente

**Status:** COMPLETED

- [x] Criar endpoint e handler de fechamento de comanda `POST /api/appointments/checkout`.
- [x] Implementar upload/armazenamento de fotos do corte com otimização.
- [x] Registrar a Ficha Técnica (`HaircutSpec`) vinculada ao cliente e barbeiro.
- [x] Atualizar saldo de comissão do barbeiro e zerar os dias decorridos no Relógio do Cliente.
- [x] Criar testes integrados para o fluxo completo de checkout do barbeiro.
