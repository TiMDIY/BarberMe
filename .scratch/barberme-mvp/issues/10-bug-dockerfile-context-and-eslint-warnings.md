# Bug Ticket 10: Ajuste de Contexto de Compilação do Dockerfile & Limpeza dos Avisos do ESLint

**Data:** 01/09/2026  
**Severidade:** Alta (Falha no Job 7 do CI)  
**Módulo Afetado:** `Dockerfile` / ESLint (`eslint.config.js`)  
**Status:** COMPLETED  

---

## 🛑 Sintomas Detectados

1. **Job 7 (Docker Build):** Abortado no GitHub Actions porque o `Dockerfile` copiava apenas `src/ ./src`, mas o `npx tsc` dependia da presença das pastas `tests/` e `scripts/` mapeadas no `tsconfig.json`.
2. **Job 1 (Linting Warnings):** Apresentou 7 avisos de variáveis de imports não utilizados (`db`) e erros de exceção (`_err`).

---

## 🛠️ Correções Aplicadas

1. **Dockerfile:** Atualizado a etapa *builder* para copiar `tests/` e `scripts/`, e ajustado o runner para `npm install --omit=dev --no-audit`.
2. **Limpeza do Lint:** Removidas as importações não utilizadas de `db` em todos os testes e serviços, e configurado o ESLint para aceitar variáveis prefixadas com `_` (`caughtErrorsIgnorePattern: "^_"`).
3. **Resultado Local:** `npm run lint` rodando com **0 erros e 0 warnings**.
