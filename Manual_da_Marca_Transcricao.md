# Manual da Marca — Armazém Offshore
**Transcrição estruturada para auditoria de identidade visual**

Documento original: *Apresentação da Marca — Armazém Offshore*
Estúdio responsável: Luun Studio
Data: ABR/2023
Total de páginas: 34

---

## Sumário do manual

| Página | Conteúdo |
|---|---|
| 1 | Capa — "Projeto de Identidade Visual" |
| 2 | Briefing |
| 3 | Palavras-chave |
| 4 | A Marca — conceito |
| 5 | Tipografia — Montserrat (introdução) |
| 6 | **Família tipográfica completa (Montserrat + Open Sans)** |
| 7 | Divisor visual — "Armazém Offshore" |
| 8 | **Paleta de cores institucionais (completa)** |
| 9 | Divisor — Pesquisa Visual |
| 10 | Moodboard fotográfico |
| 11 | O conceito (composição do símbolo) |
| 12 | Malha de construção do símbolo (grid 10x) |
| 13 | Logo símbolo isolado em fundo navy |
| 14 | Significado do símbolo |
| 15 | **Versões do logo em diferentes fundos** |
| 16 | Logo principal em fundo amarelo |
| 17 | Variações de aplicação (selo, monocromático em verde água) |
| 18 | **LOGO PRINCIPAL COMPLETO** (com tagline "Suprimentos Industriais") |
| 19 | **Tons monocromáticos (fundo preto e fundo claro)** |
| 20 | Aplicação — Cartões de visita |
| 21 | Aplicação — Instagram |
| 22 | Aplicação — Papel timbrado e envelope |
| 23 | Aplicação — Crachá |
| 24 | **Aplicação — Letreiro/fachada (banner "Suprimentos")** |
| 25 | Aplicação — Posts redes sociais (35 anos / Especialista em MRO) |
| 26 | Aplicação — Botons, calendário, outdoor |
| 27 | Aplicação — Outdoor/billboard |
| 28 | Aplicação — Uniformes |
| 29 | Aplicação — Perfil Instagram (laptop mockup) |
| 30 | Aplicação — Perfil LinkedIn |
| 31 | Aplicação — Assinatura de e-mail |
| 32 | Aplicação — Adesivos e copos descartáveis |
| 33 | Aplicação — Posts Instagram (variações) |
| 34 | **Aplicação — Galpão/operação (banner "Porto do Açu")** |

---

## 1. TIPOGRAFIA

### Família tipográfica oficial (página 6)

A marca usa **DUAS famílias tipográficas complementares**:

#### 1.1 Montserrat Extra-Bold
- **Uso**: títulos grandes
- **Exemplo no manual**: "Qualidade e confiança em cada produto"
- **Característica**: linhas limpas e retas, transmite modernidade, alegria e tecnologia; nas variações ousadas transmite personalidade aventureira

#### 1.2 Open Sans
- **Uso**: textos corridos / parágrafos
- **Exemplo no manual**: parágrafos descritivos do manual

### Justificativa da escolha (página 5)
> "A escolha da fonte Montserrat para o logo foi feita com base em seus atributos de modernidade, alegria e tecnologia. Além disso, a fonte apresenta linhas limpas e retas, transmitindo uma sensação de conservadorismo e cuidado, ideias importantes para a marca. A Montserrat também possui uma personalidade aventureira e radical em suas variações mais ousadas, o que traz um equilíbrio perfeito para o universo do mercado de MRO."

### ⚠️ Implicação para o site
- O site atualmente usa **Inter** (segundo o próprio designer)
- **Deve ser substituído** por:
  - Títulos / heading 1, 2, 3 → **Montserrat ExtraBold (800)**
  - Corpo de texto / parágrafos → **Open Sans (Regular 400, Semibold 600)**
- Ambas são fontes Google Fonts gratuitas:
  - `https://fonts.google.com/specimen/Montserrat`
  - `https://fonts.google.com/specimen/Open+Sans`

---

## 2. PALETA DE CORES (página 8)

### 2.1 Cores Principais

#### Amarelo
- **Pantone**: 123 C
- **HEX**: `#FFD000`
- **RGB**: `255, 208, 0`
- **CMYK**: `0%, 19%, 89%, 0%`

#### Azul escuro (Navy)
- **Pantone**: 295 C
- **HEX**: `#002E4A`
- **RGB**: `0, 46, 74`
- **CMYK**: `100%, 69%, 8%, 54%`

### 2.2 Cores Secundárias

#### Verde Água
- **Pantone**: 3242
- **HEX**: `#89D6C2`
- **RGB**: `137, 214, 194`
- **CMYK**: `33%, 0%, 20%, 0%`

#### Cinza
- **Pantone**: Cool Gray 2 C
- **HEX**: `#D7D7D7`
- **RGB**: `215, 215, 215`
- **CMYK**: `0%, 0%, 0%, 16%`

### 2.3 Conceito da paleta
> "O amarelo escolhido é vibrante e transmite a energia e a dinâmica presentes no mercado offshore. Além disso, essa cor é associada à inovação e ao otimismo. Já o azul escuro é uma cor que inspira confiança, credibilidade e segurança, além de remeter ao mar e ao céu, elementos presentes no ambiente de atuação da marca."

### ✅ Validação para o site
- Navy `#002E4A` e Amarelo `#FFD000` já estão corretos
- **Verificar se as cores secundárias (Verde Água `#89D6C2` e Cinza `#D7D7D7`) estão definidas como variáveis no design system** — são oficiais e devem estar disponíveis para uso

### Tokens recomendados (CSS / Tailwind)
```css
:root {
  --brand-yellow: #FFD000;
  --brand-navy: #002E4A;
  --brand-mint: #89D6C2;
  --brand-gray: #D7D7D7;
}
```

---

## 3. LOGO — VERSÕES PERMITIDAS

### 3.1 Anatomia do logo
O logo é composto por:
1. **Símbolo (logomark)**: triângulo estilizado com 3 linhas paralelas formando um "A" / silhueta de telhado de armazém — significados:
   - Estabilidade, força, dinamismo, movimento
   - Telhado de armazém (referência ao nome)
   - Letra "A" inicial de Armazém
   - Linhas diagonais = dinâmica, velocidade, robustez dos metais
2. **Wordmark**: "Armazém" em Montserrat Bold + "OFFSHORE" em tracking expandido
3. **Tagline opcional**: "SUPRIMENTOS INDUSTRIAIS" (separada por divisor vertical)

### 3.2 Versões oficiais permitidas

| Versão | Onde usar | Página de referência |
|---|---|---|
| **Logo principal completo** (símbolo amarelo + wordmark branco + tagline amarela em fundo navy) | Identificação principal em fundos escuros/navy | Pág. 18 |
| **Logo navy completo** (símbolo + wordmark navy) | Em fundo amarelo, verde água, branco ou claro | Pág. 15, 16 |
| **Logo branco completo** (símbolo amarelo + wordmark branco) | Em fundo navy | Pág. 15 |
| **Logomark isolado (símbolo)** — versão amarela em linha dupla | Em fundo navy, quando o espaço é reduzido | Pág. 13, 15 |
| **Logomark isolado** — versão navy em linha dupla | Em fundo amarelo/branco/claro, quando o espaço é reduzido | Pág. 15 |
| **Versão monocromática branca** | Fundo preto/escuro quando há restrição de impressão a uma cor | Pág. 19 (topo) |
| **Versão monocromática preta/escura** | Fundo claro/cinza claro quando há restrição de impressão a uma cor | Pág. 19 (base) |
| **Selo circular** (símbolo + texto curvado "ARMAZÉM OFFSHORE • FORNECIMENTO DE SUPRIMENTOS INDUSTRIAIS") | Aplicações decorativas (adesivos, posts) | Pág. 17, 32 |

### 3.3 Regra de uso monocromático (página 19)
> "Muitas vezes, devido aos custos de produção, apenas uma cor de tinta está disponível e por isso o logotipo deve ser reproduzido usando apenas uma cor. Neste cenário, o logotipo, logomarca ou marca nominativa deve ser utilizado seguindo a convenção de utilizar um tipo de cor clara sobre fundo escuro ou um tipo de cor escura sobre fundo claro."

### 3.4 Construção do símbolo (página 12)
- A malha de construção usa proporção **10x** (10 unidades de altura)
- Esta proporção deve ser respeitada ao redimensionar
- **Não distorcer, não rotacionar, não alterar espessura das linhas**

### 3.5 Para o componente `LogoMark` do site
Ao recortar da página 18 do manual:
- O logo está em fundo navy `#002E4A`
- Versão completa com **tagline "SUPRIMENTOS INDUSTRIAIS"**
- Considerar **duas variantes no componente**:
  - `<LogoMark variant="dark" />` — para fundos escuros (usar versão da pág. 18)
  - `<LogoMark variant="light" />` — para fundos claros (usar versão da pág. 15 inferior esquerda — logo navy em fundo amarelo, recortar apenas o logo)
- Considerar versão **sem tagline** para uso compacto (header pequeno, favicon, etc.) — pode-se recortar apenas a parte esquerda do logo da pág. 18

---

## 4. ÁREA DE PROTEÇÃO E USO INCORRETO

⚠️ **O manual NÃO apresenta uma página formal com regras explícitas de:**
- Área de respiro mínima (clear space) em unidades x
- Tamanho mínimo de reprodução (em px ou mm)
- Lista de "não fazer" (não distorcer, não rotacionar, não trocar cores, etc.)

### Regras inferidas a partir das aplicações
Pela análise visual das páginas 15, 16, 18, 19 e 20–34, é possível **inferir boas práticas**:

1. **Área de respiro**: nas aplicações, há aproximadamente **1x a altura do símbolo** de espaço livre ao redor do logo
2. **Tamanho mínimo legível**: o logo com tagline parece manter legibilidade até aproximadamente **120px de largura**; abaixo disso, recomenda-se usar apenas o símbolo
3. **Fundos permitidos** (com base nas aplicações):
   - Navy `#002E4A` (oficial)
   - Amarelo `#FFD000` (oficial)
   - Branco/cinza claro
   - Verde água `#89D6C2`
   - Preto (apenas versão monocromática)
   - **Fotografias**: aceitas desde que a área onde o logo é aplicado tenha contraste suficiente (ver pág. 24 e 34)

### Recomendação para o painel admin / design system
Como o manual não fixa essas regras, **fixar internamente no design system do site**:
```
Clear space mínimo = 0.5 × altura do símbolo (em todos os lados)
Tamanho mínimo:
  - Logo completo com tagline: 160px de largura
  - Logo completo sem tagline: 120px de largura
  - Apenas símbolo (logomark): 32px de largura
```

---

## 5. ELEMENTOS GRÁFICOS DE APOIO

Recorrentes nas aplicações (não codificados como sistema formal no manual, mas observáveis):

### 5.1 Padronagem (pattern)
- Listras diagonais amarelas e navy (ver pág. 25, 26, 27, 28)
- Versão estilizada do símbolo repetido em padrão (ver pág. 22 envelope, pág. 28 fundo, pág. 32 copos)
- Útil para **fundos de banner, cards de destaque, headers de seção**

### 5.2 "Linha tracejada amarela" (pág. 23, 27)
- Pequena fileira de linhas inclinadas amarelas — usada como **divisor decorativo**
- Pode ser implementado como SVG no site

### 5.3 Hierarquia de aplicação observada
- **Fundo navy + texto branco + acentos amarelos** = padrão para banners principais
- **Fundo amarelo + texto navy** = padrão para CTAs e destaques
- **Fundo branco + texto navy** = padrão para conteúdo institucional/leitura

---

## 6. PALAVRAS-CHAVE DA MARCA (página 3)

São os atributos que devem ser transmitidos visualmente:
1. **Moderna**
2. **Alegre**
3. **Mercado Conservador**
4. **Tecnologia**
5. **Cuidado**
6. **Aventureiro**

Implicação: o design deve equilibrar **modernidade e tecnologia** (linhas limpas, espaçamento generoso, tipografia geométrica) com **conservadorismo do setor** (paleta sóbria de navy, hierarquia clara, evitar elementos excessivamente lúdicos).

---

## 7. CHECKLIST DE AUDITORIA PARA O SITE

Use esta lista para verificar conformidade:

### Tipografia
- [ ] Títulos usam **Montserrat ExtraBold (800)**
- [ ] Corpo de texto usa **Open Sans (400/600)**
- [ ] Fonte Inter foi removida de todos os componentes
- [ ] Fallbacks definidos: `'Montserrat', system-ui, sans-serif` e `'Open Sans', system-ui, sans-serif`
- [ ] Pesos importados corretamente (Montserrat 800, Open Sans 400/600 no mínimo)

### Cores
- [ ] Variáveis CSS / tokens definidos para as 4 cores oficiais
- [ ] `#FFD000` (amarelo) usado para CTAs, destaques, botão "Loja Virtual"
- [ ] `#002E4A` (navy) usado para fundos principais, header
- [ ] `#89D6C2` (verde água) disponível como cor secundária
- [ ] `#D7D7D7` (cinza) disponível como cor secundária / neutra
- [ ] Não há uso de cores fora da paleta oficial sem justificativa

### Logo
- [ ] Componente `LogoMark` usa a arte oficial recortada da pág. 18
- [ ] Existe variante para fundo claro e fundo escuro
- [ ] Proporções originais preservadas (sem distorção)
- [ ] Tamanho respeita o mínimo recomendado em cada contexto
- [ ] Clear space respeitado ao redor do logo

### Geral
- [ ] Padronagens (listras, pattern de triângulos) disponíveis como assets reutilizáveis
- [ ] Hierarquia tonal segue: navy=primária, amarelo=destaque, verde água/cinza=apoio

---

## 8. ASSETS PARA EXTRAIR DO MANUAL

Lista de imagens que devem ser recortadas do PDF para uso no site:

| Página | Asset | Uso no site | Formato sugerido |
|---|---|---|---|
| 18 | Logo principal completo (símbolo + wordmark + tagline) | Componente `LogoMark` | SVG (refeito) ou PNG transparente |
| 24 | Imagem do letreiro/fachada com logo dourado | Banner "Suprimentos para quem move o offshore" | JPG/WebP 1920x1080 |
| 34 | Imagem do galpão amarelo + colaborador | Banner "Base no Porto do Açu. Estamos onde a operação acontece." | JPG/WebP 1920x1080 |

**Observação importante sobre o logo da pág. 18**: como o manual foi exportado do Canva e tem só raster, o logo recortado será uma imagem. Para qualidade web ideal, recomenda-se **refazer o logo em SVG** (é uma forma geométrica simples — três linhas paralelas formando triângulo). Isso permite escalonamento perfeito, alteração de cor via CSS e arquivo menor.
