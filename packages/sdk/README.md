# Trackly SDK

SDK leve de analytics para tracking de eventos no browser.

## 🚀 Instalação

```bash
npm install trackly-sdk
# ou
yarn add trackly-sdk
# ou
pnpm add trackly-sdk
```

## 📦 Uso

### Inicialização

```typescript
import { Analytics } from "trackly-sdk";

const analytics = new Analytics({
  apiUrl: "https://api.seuapp.com/events",
  batchSize: 10, // opcional: eventos por batch (padrão: 10)
  flushInterval: 5000, // opcional: intervalo de envio em ms (padrão: 5000)
  maxRetries: 3, // opcional: tentativas em caso de erro (padrão: 3)
  debug: false, // opcional: ativar logs de debug (padrão: false)
});
```

### Tracking de Eventos

```typescript
// Evento customizado
analytics.track("button_clicked", {
  button: "signup",
  page: "homepage",
  variant: "primary",
});

// Pageview (automático por padrão, mas pode chamar manualmente)
analytics.pageview({
  category: "blog",
  author: "John Doe",
});

// Identificar usuário
analytics.identify("user_123", {
  email: "usuario@exemplo.com",
  name: "João Silva",
  plan: "premium",
});
```

### Exemplos Práticos

#### E-commerce

```typescript
// Produto visualizado
analytics.track("product_viewed", {
  product_id: "SKU-123",
  name: "Tênis Running",
  price: 299.9,
  category: "Esportes",
});

// Item adicionado ao carrinho
analytics.track("cart_add", {
  product_id: "SKU-123",
  quantity: 1,
  price: 299.9,
});

// Compra finalizada
analytics.track("purchase", {
  order_id: "ORD-456",
  total: 299.9,
  currency: "BRL",
  items: 1,
});
```

#### SaaS

```typescript
// Cadastro
analytics.identify("user_789", {
  email: "user@startup.com",
  company: "Startup Inc",
  plan: "trial",
});

// Feature utilizada
analytics.track("feature_used", {
  feature: "export_data",
  format: "csv",
  rows: 1500,
});

// Upgrade de plano
analytics.track("plan_upgraded", {
  from: "trial",
  to: "premium",
  mrr: 99.0,
});
```

## 🔧 API

### `Analytics`

#### Métodos

- **`track(eventName: string, properties?: EventProperties)`**  
  Rastreia um evento customizado

- **`pageview(properties?: EventProperties)`**  
  Rastreia visualização de página

- **`identify(userId: string, traits?: UserTraits)`**  
  Identifica o usuário

- **`flush(): Promise<void>`**  
  Força envio imediato dos eventos na fila

- **`getUserId(): string | undefined`**  
  Retorna o userId atual

- **`getAnonymousId(): string`**  
  Retorna o ID anônimo (persistido no localStorage)

- **`shutdown(): void`**  
  Para o SDK e limpa recursos

## 🎯 Características

- ✅ **Leve**: Sem dependências externas
- ✅ **Type-safe**: Totalmente tipado com TypeScript
- ✅ **Batch automático**: Agrupa eventos para reduzir requests
- ✅ **Retry automático**: Reenvio em caso de falha (exponential backoff)
- ✅ **sendBeacon**: Garante envio antes de sair da página
- ✅ **Contexto automático**: Captura URL, referrer, user agent, etc
- ✅ **Anonymous ID**: Tracking persistente antes da identificação

## 🏗️ Build

```bash
pnpm run build
```

Gera:

- `dist/index.js` (CommonJS)
- `dist/index.esm.js` (ES Modules)
- `dist/index.d.ts` (TypeScript definitions)

## 📊 Formato dos Eventos

Todos os eventos enviados seguem esta estrutura:

```typescript
{
  type: 'track' | 'page' | 'identify',
  timestamp: 1234567890,
  event?: 'button_clicked',           // apenas para type='track'
  properties?: { /* dados custom */ },
  userId?: 'user_123',
  anonymousId: 'anon_xxx',
  traits?: { /* dados do usuário */ }, // apenas para type='identify'
  context: {
    page: {
      url: 'https://...',
      path: '/about',
      title: 'Sobre',
      referrer: 'https://...'
    },
    userAgent: '...',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    screen: { width: 1920, height: 1080 }
  }
}
```

## 📝 Licença

MIT
