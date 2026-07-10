# Portal SKAP

Portal onde o colaborador entra com CPF ou Matrícula + senha para acompanhar sua avaliação SKAP (Habilidades Técnicas, Específicas e Empoderamento).

## Como rodar pela primeira vez

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais recente).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. O arquivo `.env` já vem com valores padrão para uso local. Antes de colocar em produção, troque `SESSION_SECRET` por uma string longa e aleatória (ex: gerada com `openssl rand -base64 32`).
4. Crie o banco de dados local:
   ```bash
   npx prisma migrate dev
   ```
5. Rode o importador para carregar os colaboradores e as avaliações a partir das planilhas Excel (ele lê a pasta configurada em `IMPORT_SOURCE_DIR` no `.env`, que por padrão aponta para a pasta acima desta, onde ficam os exports do Power BI):
   ```bash
   npm run import
   ```
   Ao final, um relatório é impresso no terminal e salvo em `last-import-report.txt`, mostrando quantos colaboradores foram importados e listando qualquer linha de avaliação/comentário que não foi possível casar com um colaborador do Cadastro (normalmente erro de digitação no nome).
6. Suba o servidor:
   ```bash
   npm run dev
   ```
   Acesse http://localhost:3000.

## Login de teste

A senha de cada colaborador é o primeiro nome em minúsculo (sem acento) + `123`. Exemplo: "Marcio Jose..." → `marcio123`. Por decisão do RH, não há troca de senha pelo colaborador — a senha padrão é definitiva.

## Reimportar dados

Sempre que o RH atualizar os exports do Power BI (mesmos nomes de arquivo, na mesma pasta), basta rodar `npm run import` de novo. A importação é segura de repetir: atualiza dados de perfil e notas, mas nunca mexe na senha de quem já tem conta.

## Esqueci minha senha (uso administrativo)

Não há recuperação de senha por e-mail (a maioria dos colaboradores não tem e-mail cadastrado). Quem administra o servidor pode resetar a senha de um colaborador para a senha padrão:

```bash
npm run reset-password -- --matricula <matricula-do-colaborador>
```

## Notas importantes

- O banco (`data/skap.db`) contém CPFs e dados pessoais — nunca commitar no git (já está no `.gitignore`).
- Em produção, o app deve rodar atrás de HTTPS (ex: nginx, Caddy ou Cloudflare Tunnel) — ele mesmo não termina TLS.
- Os 3 arquivos "Radar de Competências" não são importados: são agregados por área (Bloco), não por colaborador, e 2 dos 3 exports vêm quebrados. Não é possível montar um radar individual com os dados disponíveis hoje.
