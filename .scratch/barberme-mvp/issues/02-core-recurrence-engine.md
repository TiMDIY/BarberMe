# 02: Core Recurrence Engine & Algoritmo do Relógio do Cliente

**What to build:**
Módulo core de inteligência do produto desenvolvido via TDD. Calcula o intervalo médio biológico ($I_m$) por cliente, gerencia a transição dinâmica dos 5 estados (`EM_DIA`, `NA_JANELA`, `EM_RISCO`, `DORMENTE`, `PERDIDO`) e implementa o algoritmo de Cold Start em 3 fases para novos clientes.

**Blocked by:** 01: Setup da Infraestrutura & Modelagem de Dados Base

**Status:** COMPLETED

- [x] Implementar classe/módulo `CustomerClockEngine`.
- [x] Criar testes unitários (TDD) para cálculo do intervalo médio móvel ($I_m$).
- [x] Implementar a máquina de estados para transição automática baseada nos dias decorridos.
- [x] Implementar lógica de Cold Start em 3 fases (Intervalo por Categoria -> Média Ponderada -> Ponderação Individual).
- [x] Validar cobertura de testes para 100% dos caminhos e casos de borda.
