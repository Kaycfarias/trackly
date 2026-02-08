# Copilot Instructions - Trackly SDK

## Visão Geral

**Monorepo pnpm** com 2 packages: SDK vanilla TypeScript (`trackly-sdk`) + integração React (`trackly-react`). Zero dependências externas no core.

**Arquitetura:** `Analytics (facade) → EventQueue (batching) → Transport (HTTP/sendBeacon)`

**Publicado no npm:**
- `trackly-sdk` - Core analytics SDK
- `trackly-react` - React hooks e components

## Arquitetura & Data Flow

```
Browser → Analytics.track() → EventQueue.enqueue() → Transport.send() → API
                                     ↓
                               Auto-flush (5s ou batch de 10)
                                     ↓
                               sendBeacon (beforeunload)
```

## Estrutura do Monorepo

```
packages/
├── sdk/              # Core SDK (zero deps)
│   └── src/
│       ├── types.ts      # Single source of truth para tipos
│       ├── tracker.ts    # Analytics class (public API)
│       ├── queue.ts      # EventQueue (batching + timers)
│       ├── transport.ts  # HTTP + retry + sendBeacon
│       └── index.ts      # Public exports only
└── react/            # React integration
    └── src/
        ├── AnalyticsProvider.tsx  # Context + initialization
        ├── hooks.ts               # usePageview, useTrackEvent, useIdentify
        ├── components.tsx         # TrackClick, TrackView wrappers
        └── index.ts
```

**Package boundaries:** React package importa SDK via workspace dependency (`workspace:*`). Nunca o inverso.

## Padrões Críticos do Projeto

### 1. Dependency Injection via Constructor

Componentes recebem dependências explicitamente, **nunca instanciam internamente**:

```typescript
// ✅ Correto (queue.ts)
constructor(transport: Transport, batchSize: number = 10)

// ❌ Evitar
constructor() { this.transport = new Transport(...) }
```

Facilita testing e desacopla layers.

### 2. Required<T> para Config com Defaults

Após aplicar defaults com nullish coalescing, armazene como `Required<T>`:

```typescript
// tracker.ts padrão
this.config = {
  apiUrl: config.apiUrl,
  batchSize: config.batchSize ?? 10, // ?? preserva false/0
  debug: config.debug ?? false,
};
```

**Nunca use `||`** — impede valores falsy válidos.

### 3. Browser Lifecycle Hooks Essenciais

SDK intercepta `beforeunload` + `visibilitychange` para garantir flush:

- **`sendBeacon()`** (não fetch) em eventos de unload — sincrono, sobrevive a page close
- **`clearInterval()`** no shutdown para limpar timers
- Ver implementação em [queue.ts](packages/sdk/src/queue.ts#L95-L108)

### 4. Anonymous ID Persistence

LocalStorage key: `analytics_anonymous_id`. Pattern em [tracker.ts](packages/sdk/src/tracker.ts#L15-L27):

```typescript
function getAnonymousId(): string {
  const key = "analytics_anonymous_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = generateAnonymousId();
    localStorage.setItem(key, id);
  }
  return id;
}
```

Gerado uma vez, persiste entre sessões.

### 5. Context Auto-Capture

`getEventContext()` coleta automaticamente page metadata **em cada evento**:

- Page: url, path, title, referrer
- User agent, locale, timezone
- Screen dimensions

Implementação: [tracker.ts](packages/sdk/src/tracker.ts#L33-L50)

### 6. React Patterns Específicos

**AnalyticsProvider:** Usa `useMemo` com dependency array `[config.apiUrl]` — reinicializa SDK apenas se API URL mudar.

**Hooks reactivos:** `useTrackEvent` e `useIdentify` aceitam array de deps explícito:

```tsx
// hooks.ts pattern
useTrackEvent("product_viewed", { productId }, [productId]);
```

**Component wrappers:** `TrackClick` e `TrackView` usam `cloneElement` para preservar props originais do child.

## Comandos Essenciais

**Monorepo (root):**

```bash
pnpm build        # Build SDK → React (ordem sequencial)
pnpm dev          # Watch mode paralelo para ambos packages
pnpm clean        # Limpa todos os dist/ + cache
```

**Package individual:**

```bash
pnpm --filter trackly-sdk build     # Build apenas SDK
pnpm --filter trackly-react dev     # Watch apenas React
```

**Output:** Cada package gera `dist/index.js` + `dist/index.d.ts` via `tsc` direto (sem bundler).

## Convenções TypeScript

- **Target:** ES2015 (browser compatibility baseline)
- **Strict mode:** Sempre habilitado — nullish checks obrigatórios
- **Module:** ESNext (permite tree-shaking por consumers)
- **Imports:** Paths relativos (`./types`), extensão `.ts` omitida
- **React:** `jsx: react-jsx` (novo JSX transform, não precisa importar React)

## Expandindo o SDK

### Novo tipo de evento:

1. Adicionar literal em [types.ts](packages/sdk/src/types.ts): `AnalyticsEvent.type: "track" | "page" | "identify" | "SEU_TIPO"`
2. Criar método público em [tracker.ts](packages/sdk/src/tracker.ts) `Analytics` class
3. Garantir que `getEventContext()` é chamado para captura automática

### Novo transport:

1. Implementar interface compatível: `send(events: AnalyticsEvent[]) → Promise<SendResult>`
2. Injetar via constructor em `EventQueue` (DI pattern)
3. Adicionar fallback para `sendBeacon()` em lifecycle hooks

### Nova configuração:

1. Adicionar opcional em [types.ts](packages/sdk/src/types.ts) `AnalyticsConfig`
2. Aplicar default no constructor do `Analytics` usando `??`
3. Armazenar como `Required<AnalyticsConfig>` internamente

### Novo React hook:

1. Criar em [hooks.ts](packages/react/src/hooks.ts) — sempre use `useAnalytics()` hook
2. Envolver lógica em `useEffect` para timing de lifecycle
3. Deps array explícito — evite omitir para prevenir stale closures

## Testing Patterns (quando implementar)

- **Mock fetch:** `jest.spyOn(global, 'fetch').mockResolvedValue(...)`
- **Mock localStorage:** `Object.defineProperty(window, 'localStorage', { value: mockStorage })`
- **Mock timers:** `jest.useFakeTimers()` para testar `setInterval` em queue.ts
- **Mock sendBeacon:** `navigator.sendBeacon = jest.fn()`

## Debugging

Enable `debug: true` em `AnalyticsConfig` para console logs prefixados:

```
[Analytics] Initialized with config: {...}
[Analytics] Sending 3 events (attempt 1)
[Analytics] User identified: user_123
[Analytics] Event tracked: button_clicked
```

Grep por `this.config.debug` no código para adicionar novos logs.

## Build Output

**Sem bundler** — usa `tsc` direto para preservar:

- Código legível no output
- Tree-shakeable por consumers
- Zero overhead de configuração Webpack/Rollup

`dist/index.js` é ESNext modules, consumers aplicam próprio transpile se necessário.
