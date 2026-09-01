# Bug Ticket 12: Erro de Compilação C++ (`gyp ERR!`) no `npm install` do Dockerfile

**Data:** 01/09/2026  
**Severidade:** Média (Bloqueio do Job 7 Build & Docker Image)  
**Módulo Afetado:** `Dockerfile` / Job 7 (`stage-7-build`)  
**Status:** COMPLETED  

---

## 🛑 Sintoma do Erro

No job `7. 🏗️ Build & Production Docker Image`, a etapa `docker build -t barberme:latest .` falhou com a seguinte mensagem de log:

```text
npm error gyp ERR! node -v v22.23.2
npm error gyp ERR! node-gyp -v v11.5.0
npm error gyp ERR! not ok
...
ERROR: failed to build: failed to solve: process "/bin/sh -c npm install --omit=dev --no-audit" did not complete successfully: exit code: 1
```

---

## 🔍 Causa Raiz

No contêiner `node:22-alpine` da etapa `runner`, o `npm install --omit=dev --no-audit` tentava disparar compilações nativas de pacotes opcionais C++ via `node-gyp`. Como a imagem Alpine de produção é minimalista e não contém utilitários como `python3`, `make` e `g++`, o processo falhava com erro de build.

---

## 🛠️ Correção Aplicada

1. Adicionada a flag `--ignore-scripts` nas chamadas de `npm install` do `Dockerfile`.
2. Isso instrui o npm a ignorar scripts de compilação C++ desnecessários em tempo de containerização.
3. Efetuado o commit via trava do Husky e `git push origin main`.
