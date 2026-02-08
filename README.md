# Trackly SDK Monorepo

Event tracking SDK para browser com companion package React.

## 📦 Packages

### [trackly-sdk](./packages/sdk)

Core SDK vanilla TypeScript. **Zero dependências**.

```typescript
import { Analytics } from "trackly-sdk";

const analytics = new Analytics({
  apiUrl: "https://api.example.com/events",
});

analytics.track("button_clicked", { label: "signup" });
analytics.pageview();
analytics.identify("user_123", { email: "user@example.com" });
```

### [trackly-react](./packages/react)

Integração React com hooks e componentes.

```tsx
import { AnalyticsProvider, useAnalytics, TrackClick } from "trackly-react";

function App() {
  return (
    <AnalyticsProvider config={{ apiUrl: "https://api.example.com/events" }}>
      <MyApp />
    </AnalyticsProvider>
  );
}

function MyApp() {
  const analytics = useAnalytics();

  return (
    <TrackClick eventName="cta_clicked" properties={{ location: "hero" }}>
      <button>Sign Up</button>
    </TrackClick>
  );
}
```

## 🚀 Setup

```bash
pnpm install
pnpm build
```

## 📖 Documentação

- [SDK Core README](./packages/sdk/README.md)
- [React Integration](./packages/react/README.md)

## 🏗️ Desenvolvimento

```bash
# Build todos os packages
pnpm build

# Watch mode (development)
pnpm dev

# Clean builds
pnpm clean

# Build apenas SDK
pnpm --filter trackly-sdk build

# Build apenas React
pnpm --filter trackly-react build
```

## 📝 Licença

MIT
