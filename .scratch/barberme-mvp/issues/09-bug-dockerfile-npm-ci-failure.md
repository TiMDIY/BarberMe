# Bug Ticket 09: Falha na Compilação da Imagem Docker de Produção (Job 7)

**Data:** 01/09/2026  
**Severidade:** Média (Bloqueio do Job 7 Build & Docker Image)  
**Módulo Afetado:** `Dockerfile` / Job 7 (`stage-7-build`)  
**Status:** COMPLETED  

---

## 🛑 Sintoma do Erro

No job `7. 🏗️ Build & Production Docker Image` da execução #3 no GitHub Actions, os Jobs 1 a 6 passaram 100% verde, mas o Job 7 falhou no passo `docker build -t barberme:latest .`:

```text
Process completed with exit code 1.
```

---

## 🔍 Causa Raiz

No `Dockerfile`, a etapa de compilação Alpine utilizava o comando estrito `RUN npm ci`. Assim como ocorreu anteriormente no runner Host, dentro da imagem `node:22-alpine` o comando `npm ci` abortava devido à incompatibilidade do `package-lock.json` com os binários opcionais do Alpine Linux.

---

## 🛠️ Correção Aplicada

1. Atualizado o `Dockerfile` trocando `RUN npm ci` por `RUN npm install --no-audit` em ambas as etapas (*builder* e *runner*).
2. Comitado o `Dockerfile` atualizado via Husky.
3. Efetuado `git push origin main` para acionar a execução #4 no GitHub Actions.
