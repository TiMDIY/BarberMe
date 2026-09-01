# 06: Módulo de Assinaturas & Clube da Barba (Receita Recorrente)

**What to build:**
Gestão de contratos mensais recorrentes (MRR) para clientes. Permite assinar planos (ex: 2x ou 4x por mês), gerenciar cobrança recorrente e dar acesso imediato a prioridade de agendamento no motor de recorrência.

**Blocked by:**
- 01: Setup da Infraestrutura & Modelagem de Dados Base
- 02: Core Recurrence Engine & Algoritmo do Relógio do Cliente

**Status:** COMPLETED

- [x] Implementar cadastro e regras dos Planos de Assinatura.
- [x] Criar controle de saldo mensal de cortes por cliente assinante.
- [x] Integrar gateway de pagamentos recorrentes (Stripe / Asaas / Pix Recorrente).
- [x] Conectar renovação mensal automática com o motor de agendamento prioritário.
- [x] Criar testes integrados para o ciclo de vida da assinatura (ativação, cobrança, cancelamento).
