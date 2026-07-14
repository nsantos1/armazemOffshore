# Guia de Deploy — Armazém Offshore

Site institucional em **Next.js 16 + TypeScript**.

> ⚠️ **Decisões ainda em definição:** (1) onde hospedar (o servidor da empresa é
> PHP-only e não roda Next.js → provável Vercel ou um VPS Node) e (2) qual **banco
> de dados** usar. Este guia cobre o que já é fixo; os pontos marcados como
> **PENDENTE** dependem dessas duas escolhas.

---

## Como os dados são armazenados
O conteúdo do site (banners, parceiros, identidade, configurações, certificações,
categorias), as **notícias** e os **leads** são gravados no banco **Turso** (libSQL,
que é SQLite na nuvem), através de uma camada em [`src/lib/db.ts`](src/lib/db.ts) —
tabela chave→valor `kv(key, value)`.

- **Desenvolvimento local:** sem `TURSO_DATABASE_URL`, roda em modo **arquivo**
  (`file:./data/app.db`) — não precisa de conta nem internet.
- **Produção:** crie uma base grátis em **turso.tech** e defina `TURSO_DATABASE_URL`
  + `TURSO_AUTH_TOKEN`. Funciona no Vercel (Turso é acessado por HTTP).

> **Imagens/documentos** enviados pelo admin (logos, capas, PDFs) são gravados **no
> próprio banco** (Turso) e servidos por `/api/file/<id>` com cache. Funciona no
> Vercel, sem disco. (Os arquivos que já vêm no repositório — `public/documentosPdf`,
> `public/marcasParceiras` — continuam servidos como estáticos.)

## Variáveis de ambiente (`.env` / painel do host)
Copie de `.env.example`. Principais:

```bash
# E-mail (SMTP) — formulário de contato e newsletter
MAIL_SMTP_HOST=
MAIL_SMTP_PORT=
MAIL_SMTP_SECURE=
MAIL_USER=
MAIL_PASS=
MAIL_FROM_NAME=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
PASSWORD_RESET_TO=

# Banco de dados: Turso (libSQL). Local usa arquivo; produção usa a nuvem.
DB_DRIVER=turso
TURSO_DATABASE_URL=libsql://sua-base.turso.io   # (produção)
TURSO_AUTH_TOKEN=seu-token                       # (produção)

# Chave de ESCRITA do admin — OBRIGATÓRIA para publicar conteúdo.
# Gere: node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
NEXT_PUBLIC_ADMIN_API_KEY=<valor-aleatorio>
```

> 🔑 **`NEXT_PUBLIC_ADMIN_API_KEY` entra no bundle em BUILD TIME.** Se mudar, refaça
> o build. Definir depois do build não adianta.

## Publicação (depende do host — PENDENTE)
- **Vercel:** conecte o repositório do GitHub; o Vercel builda e roda sozinho.
  Configure as variáveis em *Project > Settings > Environment Variables* (incluindo
  `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`) e refaça o deploy. Banco (Turso) e uploads
  (no banco) já funcionam no Vercel.
- **VPS Node:** `npm ci && npm run build && pm2 start "npm run start"`. Aí os uploads
  em disco funcionam; o banco pode ser local ou gerenciado.

## Primeiro acesso
- Site público: `https://armazemoffshore.com.br` — o conteúdo é **semeado
  automaticamente** com os dados atuais da empresa na primeira leitura.
- Painel admin: `https://armazemoffshore.com.br/ac-admin`
  - Login: `marketing@armazemoffshore.com.br` / `Arm@2026!`

## Teste de fumaça pós-deploy (2 min)
1. `/ac-admin` → login.
2. Em **Configurações**, mude o telefone e **Salvar**.
   - Deve aparecer **"Configurações salvas"** (verde). Se der erro vermelho de
     "não foi possível salvar no servidor" → revise a chave/banco.
3. Abra o site em aba anônima e confirme que a mudança apareceu.
4. Envie o **formulário de contato** e confira o e-mail + o registro do lead.
5. Publique uma **notícia de teste**, veja no blog e depois exclua.

---

## Limitações conhecidas (roadmap)
- **Arquivos grandes:** uploads muito grandes (PDFs de vários MB) podem exceder o
  limite por registro do banco; nesse caso, use o campo de URL do documento.
- **Autenticação do admin** é no cliente (senha e chave de escrita no bundle) —
  barreira, não segurança real. Próximo passo: **auth de servidor (sessão httpOnly)**.
- **Newsletter** ainda não é production-ready (lista de inscritos por navegador).
- **SEO:** conteúdo carrega via JavaScript; melhoria futura é SSR.
- **DNS de e-mail:** configurar **SPF, DKIM e DMARC** para não cair em spam.
