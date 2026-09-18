# KAUÃ STYLE — e-commerce

Loja on-line completa para a @kauastyle_: catálogo, carrinho, checkout com
gateway, conta do cliente, rastreamento e painel administrativo.

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript | SSR/SSG numa base só, rotas de API no mesmo projeto |
| Estilo | Tailwind CSS v4 | tokens da marca em `src/app/globals.css`, sem CSS-in-JS no runtime |
| Banco | Prisma + SQLite | trocar para Postgres é mudar o `provider` e a `DATABASE_URL` |
| Sessão | JWT (`jose`) em cookie httpOnly + tabela `Sessao` | permite revogar acesso sem esperar o token expirar |
| Senha | `bcryptjs`, custo 12 | puro JS, sem compilação nativa no Windows |
| Validação | `zod` | o mesmo esquema valida API e formulário |
| Pagamento | Mercado Pago Checkout Pro via REST | sem SDK extra; cartão nunca toca nosso servidor |

Fora isso não há dependência: ícones, animações, carrossel, zoom e máscaras são
código próprio. O JS compartilhado da loja fica em **103 kB**.

## Subir o projeto

```bash
npm install
cp .env.example .env        # ajuste as chaves (veja abaixo)
npm run setup               # gera o client, cria o banco e popula o catálogo
npm run dev                 # http://localhost:3000
```

Conta de administrador criada pelo seed (definida em `.env`):

```
admin@kauastyle.com.br  ·  KauaStyle@2026
```

> Troque essa senha antes de colocar no ar.

## Variáveis de ambiente

| Variável | Obrigatória | O que faz |
| --- | --- | --- |
| `DATABASE_URL` | sim | conexão do banco |
| `AUTH_SECRET` | sim | assina o cookie de sessão (32+ caracteres) |
| `NEXT_PUBLIC_SITE_URL` | sim | base das URLs canônicas, sitemap e retorno do gateway |
| `NEXT_PUBLIC_WHATSAPP` | sim | número usado em todos os botões de atendimento |
| `NEXT_PUBLIC_INSTAGRAM` | não | usuário exibido na seção do feed |
| `MERCADOPAGO_ACCESS_TOKEN` | não | liga o pagamento online |
| `MERCADOPAGO_WEBHOOK_SECRET` | não | valida a assinatura das notificações |
| `RESEND_API_KEY` | não | liga os e-mails transacionais |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | não | conta de admin criada pelo seed |

**Sem `MERCADOPAGO_ACCESS_TOKEN` o site continua funcionando**: o pedido é
registrado como `AGUARDANDO_PAGAMENTO` e a loja combina o Pix pelo WhatsApp.
Nenhum pedido vira "Pago" sem confirmação real — ou do webhook do gateway, ou do
administrador registrando manualmente o recebimento no painel. O painel avisa
enquanto essas chaves estiverem faltando.

## Colocar as fotos reais

O catálogo já está cadastrado com os 34 produtos da loja. As imagens hoje são
artes vetoriais próprias (ficha técnica em fio de ouro sobre ardósia) que ocupam
o lugar das fotos. Há três caminhos para trocar — escolha um.

### 1. Pelo painel (mais fácil, funciona do celular)

`Painel → Produtos → abrir a peça → Fotos → Escolher fotos do computador`

Dá para selecionar várias de uma vez. Elas são enviadas, entram na lista e você
arrasta a ordem com a seta (a primeira é a capa). Salve a peça no fim.
Aceita JPG, PNG e WebP até 8 MB cada.

### 2. Em lote, por pasta

```bash
npm run fotos        # sem argumentos: lista todos os slugs
```

Crie `fotos-originais/<slug-da-peça>/` e jogue as imagens dentro — a ordem
alfabética do nome vira a ordem no site. Depois rode `npm run fotos` de novo:
ele copia, renomeia e atualiza o banco. A pasta `fotos-originais/` fica fora do
Git, então as originais não vão para o repositório.

```
fotos-originais/
├── conjunto-casablanca-noir/
│   ├── 1-look-completo.jpg
│   ├── 2-bone.jpg
│   └── 3-detalhe-gola.jpg
└── camiseta-ea7-logo-oval/
    └── 1-frente.jpg
```

### 3. Copiando na mão

Coloque em `public/produtos/<slug>/01.jpg`, `02.jpg`… e rode `npm run db:seed`.
O seed detecta arquivos reais e passa a usá-los, ignorando os SVG.

**Proporção:** o layout espera 3:4 (ex.: 1200×1600), o mesmo enquadramento dos
posts do Instagram. Fotos em outra proporção são cortadas pelo centro.

**Atenção na hospedagem:** o upload grava em disco. Isso funciona em VPS ou
container com volume. Em serverless (Vercel), o disco é apagado a cada deploy —
nesse caso use os caminhos 2 ou 3 antes de publicar, ou troque a gravação em
`src/app/api/admin/upload/route.ts` por um bucket (S3, R2, Vercel Blob).

## Scripts

```bash
npm run dev              # desenvolvimento
npm run build            # build de produção
npm start                # sobe o build
npm run setup            # generate + db push + seed
npm run db:seed          # repopula o catálogo (idempotente)
npm run db:studio        # inspeciona o banco
npm run artes            # regera as artes de ambiente
npm run fotos            # importa as fotos reais de fotos-originais/
npm run verificar        # verifica a loja (com o servidor no ar)
npm run verificar:admin  # verifica o painel (com o servidor no ar)
```

Os dois scripts de verificação batem na API real: validam preço, estoque,
cupom, frete, criação de pedido, baixa de estoque, idempotência do webhook,
proteção de rotas e o CRUD do painel. Criam e apagam os próprios dados.

## Arquitetura

```
src/
├── app/
│   ├── (loja)/           páginas públicas e área do cliente
│   ├── admin/            painel (protegido por middleware + exigirAdmin)
│   └── api/              rotas de API
├── components/           por domínio: produto, carrinho, checkout, admin…
├── lib/
│   ├── auth.ts           sessão, hash de senha, guardas
│   ├── consultas.ts      leitura do catálogo (filtros, facetas, vitrine)
│   ├── validacoes.ts     esquemas zod de toda entrada
│   ├── pedidos.ts        confirmação de pagamento e linha do tempo
│   ├── mercadopago.ts    integração com o gateway
│   ├── frete.ts          regras de entrega
│   └── politicas.ts      textos legais e FAQ
└── middleware.ts         barreira de /admin e /conta
```

### Decisões que valem conhecer

- **Dinheiro em centavos (inteiro).** Nada de float em preço.
- **O carrinho vive no navegador; o preço vive no banco.** O checkout só recebe
  `varianteId` e `quantidade` — preço, promoção, desconto e frete são
  recalculados no servidor. Alterar o preço no DevTools não muda nada.
- **Estoque baixa na confirmação do pagamento, não na criação do pedido.**
  Carrinho abandonado não segura peça. A função é idempotente: o Mercado Pago
  reenvia a mesma notificação várias vezes e o saldo só cai uma.
- **O webhook não é fonte de verdade.** Ele só avisa "olhe o pagamento X";
  consultamos a API do gateway e ainda conferimos se o valor pago bate com o
  total do pedido.
- **Item de pedido é snapshot.** Nome, preço, tamanho e foto ficam gravados no
  pedido: editar a peça depois não reescreve o histórico.
- **Peça já vendida não é excluída, é desativada.** Mesma regra para cupons já
  usados — o histórico continua íntegro.
- **Variantes são atualizadas, nunca recriadas**, para não quebrar a referência
  dos pedidos antigos.

## Segurança

- Senhas com bcrypt (custo 12); o banco nunca vê a senha em texto.
- Sessão em cookie `httpOnly`, `sameSite=lax`, `secure` em produção.
- Recuperação de senha guarda só o hash SHA-256 do token, expira em 1 hora, é de
  uso único e derruba todas as sessões abertas.
- Login responde igual para e-mail inexistente e senha errada.
- Limite de tentativas por IP e por conta em login, cadastro, cupom, checkout,
  contato e avaliações.
- Toda entrada passa por zod antes de tocar o banco; Prisma parametriza as
  consultas (sem SQL injection).
- Rotas administrativas checadas em duas camadas: middleware (assinatura) e
  servidor (`exigirAdmin` / `adminDaApi`, que conferem a sessão no banco).
- **Nenhum dado de cartão passa pelo site nem é armazenado.** O cliente digita
  no ambiente do Mercado Pago; recebemos de volta apenas id e status.
- Cabeçalhos `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e
  `Permissions-Policy` aplicados globalmente.

## Colocar no ar

### O que precisa mudar antes de publicar

Em desenvolvimento o banco é um arquivo SQLite e as fotos são gravadas em disco.
As duas coisas funcionam num servidor comum, mas **não funcionam em hospedagem
serverless** (Netlify, Vercel), onde cada requisição roda numa função isolada e
sem disco persistente:

| Recurso | VPS / Railway / Render | Netlify / Vercel |
| --- | --- | --- |
| Banco SQLite | funciona | **não funciona** — precisa de Postgres |
| Upload de fotos pelo painel | funciona | **não funciona** — precisa de bucket |

O `npm run build` avisa e para o deploy se detectar SQLite num ambiente
serverless, em vez de publicar um site que quebraria no primeiro pedido.

### Caminho A — Netlify (ou Vercel) + Postgres

1. **Crie um Postgres gratuito** no [Neon](https://neon.tech) ou
   [Supabase](https://supabase.com) e copie a connection string.

2. **Configure as variáveis** em *Site settings → Environment variables*:

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | a string do Postgres (`postgresql://…`) |
   | `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
   | `NEXT_PUBLIC_SITE_URL` | `https://seu-site.netlify.app` |
   | `NEXT_PUBLIC_WHATSAPP` | seu número com DDI e DDD |
   | `ADMIN_EMAIL` / `ADMIN_SENHA` | sua conta de admin |
   | `MERCADOPAGO_ACCESS_TOKEN` | opcional, liga o pagamento |
   | `RESEND_API_KEY` | opcional, liga os e-mails |

3. **Crie as tabelas e popule o catálogo**, uma vez só, da sua máquina:

   ```bash
   DATABASE_URL="postgresql://…" npm run db:deploy
   ```

   No PowerShell: `$env:DATABASE_URL="postgresql://…"; npm run db:deploy`

4. **Suba as fotos antes do deploy.** Como o painel não consegue gravar em disco
   nesse ambiente, use `npm run fotos` localmente (veja a seção acima) e faça o
   commit — as imagens vão em `public/` junto com o código.

5. Deploy. O `netlify.toml` já está no repositório com o plugin, a versão do
   Node e o engine do Prisma para Linux.

### Caminho B — VPS, Railway ou Render (recomendado para esta loja)

Mais simples e mais barato aqui, porque o upload de fotos pelo painel continua
funcionando e você não precisa de bucket nem de banco externo.

```bash
git clone … && cd telasite
npm ci
cp .env.example .env      # ajuste as chaves
npm run setup
npm run build
npm start                 # atrás de nginx/caddy com HTTPS
```

Em Railway/Render, adicione um **volume persistente** montado em `/app/public/produtos`
e em `/app/prisma` (ou use o Postgres do próprio serviço, ajustando a `DATABASE_URL`).

### Depois de publicar, em qualquer caminho

- Troque a senha do admin.
- No painel do Mercado Pago, cadastre o webhook:
  `https://SEUDOMINIO/api/pagamentos/mercadopago/webhook` e copie a chave para
  `MERCADOPAGO_WEBHOOK_SECRET`.
- Confirme que `NEXT_PUBLIC_SITE_URL` é o domínio real — sitemap, URLs canônicas
  e o retorno do pagamento dependem disso.
- Rode `npm run verificar https://SEUDOMINIO` para conferir os fluxos no ar.

## SEO

Títulos e descrições por página, Open Graph, URLs amigáveis, `sitemap.xml` e
`robots.txt` gerados a partir do banco, dados estruturados de `Product` (com
preço, disponibilidade e nota média) e de `FAQPage`, `alt` em todas as imagens,
e `noindex` nas telas de fluxo (carrinho, checkout, pedido, conta, painel).
