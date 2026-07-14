# Armazém Offshore — Site Institucional

Site institucional da **Armazém Offshore** (suprimentos MRO para a indústria naval e
petrolífera), com **painel administrativo** para o cliente gerenciar o próprio conteúdo.

Construído em **Next.js 16 + TypeScript**, com armazenamento em **Turso** (SQLite na
nuvem) e envio de e-mail por **SMTP próprio**.

---

## ✨ Funcionalidades

- **Site público bilíngue** (Português / English) — seletor de idioma no header.
- **Blog / Notícias** com editor rico, categorias, busca e SEO por post.
- **Seções gerenciáveis:** banners (hero), parceiros (fornecedores/clientes),
  certificações (com documentos), "Quem Somos", pilares, soluções e configurações.
- **Formulário de contato** — envia e-mail (SMTP) e guarda o lead no banco.
- **Certificações** com upload de documentos (PDF) ou link.
- **Painel administrativo** (`/ac-admin`) para o cliente editar tudo isso — as
  alterações aparecem para todos os visitantes.
- **Newsletter** (base para disparo por SMTP — em evolução).

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React + TypeScript |
| Estilo | Tailwind CSS |
| Banco de dados | Turso / libSQL (SQLite na nuvem) — `@libsql/client` |
| E-mail | SMTP próprio via `nodemailer` |
| Uploads | Guardados no próprio banco e servidos por `/api/file/<id>` |

---

## 🚀 Rodando localmente

Pré-requisitos: **Node.js 20+** e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env a partir do exemplo e preencher
cp .env.example .env

# 3. Rodar em desenvolvimento
npm run dev
# → http://localhost:3000
```

> **Banco em desenvolvimento:** sem `TURSO_DATABASE_URL` no `.env`, o app roda em
> **modo arquivo local** (`data/app.db`) automaticamente — não precisa de conta nem
> internet. O conteúdo é **semeado** com os dados da empresa no primeiro acesso.

### Scripts
| Comando | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |

---

## 🔐 Variáveis de ambiente

Todas estão documentadas em [`.env.example`](.env.example). Resumo:

| Variável | Para que serve |
|---|---|
| `MAIL_SMTP_HOST` / `PORT` / `SECURE` / `MAIL_USER` / `MAIL_PASS` | Servidor SMTP (contato + newsletter) |
| `MAIL_FROM_NAME`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Remetente / destino dos leads |
| `PASSWORD_RESET_TO` | Destino das solicitações de "Esqueci a senha" |
| `DB_DRIVER` | `turso` (padrão) ou `memory` |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Banco Turso (produção) |
| `NEXT_PUBLIC_ADMIN_API_KEY` | Protege a **escrita** de conteúdo pelo admin |

> ⚠️ O `.env` contém segredos e **não é versionado** (ver `.gitignore`). Em produção,
> configure as variáveis no painel do host (ex.: Vercel).

---

## 🛠️ Painel administrativo

- **Acesso:** `/ac-admin` (ex.: `https://armazemoffshore.com.br/ac-admin`)
- **Login:** `e-mail do usuário` / `senha do usuário`
- O cliente edita banners, notícias, parceiros, certificações, identidade visual e
  configurações. Cada "Salvar" só confirma o sucesso **depois** de gravar no servidor.

> A autenticação atual é validada no cliente (paliativo) — ver *Roadmap*.

---

## 🗄️ Como os dados são guardados

Tudo passa por uma **camada genérica de banco** ([`src/lib/db.ts`](src/lib/db.ts)),
numa tabela chave→valor `kv(key, value)`:

- **Conteúdo** do site (banners, parceiros, settings, identidade, certificações,
  categorias) → chaves `content:*`.
- **Notícias** → chave `posts`.
- **Leads** do formulário → chave `leads`.
- **Arquivos** (imagens/PDFs enviados) → chaves `file:<id>`.

Trocar de banco no futuro = criar um novo adapter em `src/lib/adapters/` e um `case`
no `db.ts`. O resto do código não muda.

---

## 📁 Estrutura (resumo)

```
src/
  app/            # App Router + rotas de API (/api/*)
  app-shell/      # App raiz (SPA por hash) + roteador
  features/
    public/       # Site público (header, hero, seções, blog, contato, ...)
    admin/        # Painel administrativo
  lib/            # db, stores, api, i18n, seed, e-mail, uploads, tipos
  components/     # UI compartilhada (botões, modais, ícones, ...)
public/           # Assets estáticos (logos, PDFs de certificação, imagens)
```

---

## 🌐 Deploy

Passo a passo completo em **[DEPLOY.md](DEPLOY.md)**. Em resumo (Vercel): defina as
variáveis de ambiente (incl. `TURSO_*` e `NEXT_PUBLIC_ADMIN_API_KEY`), conecte o
repositório e publique. Banco e uploads já funcionam no Vercel via Turso.

---

## 🧭 Roadmap / limitações conhecidas

- **Autenticação de servidor** (sessão httpOnly + hash de senha) — hoje o login é
  validado no cliente.
- **Newsletter**: a base de inscritos ainda evolui para o banco.
- **SEO**: conteúdo carregado via JavaScript; melhoria futura é SSR.
- **Arquivos muito grandes** (PDFs de vários MB) podem exceder o limite por registro
  do banco — nesse caso, usar o campo de URL do documento.
- **DNS de e-mail:** configurar SPF/DKIM/DMARC no domínio para não cair em spam.

---

Desenvolvido por **Nicolas Santos** · [devnsantos.com](https://devnsantos.com/)
