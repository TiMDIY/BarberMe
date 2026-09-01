# Bug Ticket 08: Falha no Job de CI do GitHub Actions (`npm ci` Out of Sync)

**Data:** 01/09/2026  
**Severidade:** Alta (Bloqueio do Pipeline de CI)  
**Módulo Afetado:** CI/CD GitHub Actions (`.github/workflows/ci.yml`)  
**Status:** COMPLETED  

---

## 🛑 Sintoma do Erro

No job `stage-1-lint` do GitHub Actions, o passo `npm ci` falhou com a seguinte mensagem de log:

```text
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @emnapi/runtime@1.11.3 from lock file
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Clean install a project
Error: Process completed with exit code 1.
```

---

## 🔍 Causa Raiz

Durante a instalação da biblioteca do **Playwright** (`@playwright/test`), o arquivo `package.json` foi atualizado com novas dependências nativas e opcionais de plataforma. No entanto, o `package-lock.json` gerado no ambiente Windows não incluiu as dependências transientes para o ambiente Linux Ubuntu do GitHub Actions (`@emnapi/runtime` e `@emnapi/core`).

Como o comando `npm ci` é estrito e exige sincronia 100% perfeita entre `package.json` e `package-lock.json`, o build no Ubuntu foi abortado.

---

## 🛠️ Plano de Correção

1. Executar `npm install` no repositório para regenerar o `package-lock.json` sincronizado com todas as plataformas.
2. Comitar o `package-lock.json` atualizado com o Husky pre-commit ativo.
3. Dar `git push origin main` e acompanhar a execução verde dos 8 estágios no GitHub Actions.
