# trackly-react

React integration for [trackly-sdk](../sdk).

## 🚀 Instalação

```bash
npm install trackly-sdk trackly-react
# ou
yarn add trackly-sdk trackly-react
# ou
pnpm add trackly-sdk trackly-react
```

## 📦 Uso

### 1. Wrap your app com AnalyticsProvider

```tsx
// app/layout.tsx
import { AnalyticsProvider } from "trackly-react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider
          config={{
            apiUrl: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
            debug: process.env.NODE_ENV === "development",
          }}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 2. Use o hook `useAnalytics`

```tsx
import { useAnalytics } from "trackly-react";

function MyComponent() {
  const analytics = useAnalytics();

  const handlePurchase = () => {
    analytics.track("purchase_completed", {
      amount: 99.9,
      currency: "BRL",
      items: 2,
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### 3. Use componentes de tracking

```tsx
import { TrackClick, TrackView } from 'trackly-react';

// Track clicks
<TrackClick eventName="signup_clicked" properties={{ source: 'header' }}>
  <button>Sign Up</button>
</TrackClick>

// Track views (on mount)
<TrackView eventName="modal_opened" properties={{ type: 'promo' }}>
  <Modal>Promo content</Modal>
</TrackView>
```

### 4. Use hooks utilitários

```tsx
import { usePageview, useTrackEvent, useIdentify } from "trackly-react";

function ProductPage({ productId }) {
  // Auto-track pageview on mount
  usePageview({ category: "product", productId });

  // Track evento com dependências
  useTrackEvent("product_viewed", { productId }, [productId]);

  return <div>Product {productId}</div>;
}

function App({ user }) {
  // Identify user quando mudar
  useIdentify(user?.id, { email: user?.email, plan: user?.plan }, [user]);

  return <div>App</div>;
}
```

## 🎯 API

### Components

- **`<AnalyticsProvider>`** - Context provider (obrigatório no root)
- **`<TrackClick>`** - Wrapper para tracking de clicks
- **`<TrackView>`** - Wrapper para tracking de views (mount)

### Hooks

- **`useAnalytics()`** - Retorna instância do Analytics
- **`usePageview(properties?)`** - Auto-track pageview no mount
- **`useTrackEvent(name, properties?, deps?)`** - Track evento com deps reativas
- **`useIdentify(userId?, traits?, deps?)`** - Identify user com deps reativas

## 🔧 TypeScript

Totalmente tipado. Import types do SDK:

```tsx
import type { EventProperties, UserTraits } from "trackly-react";
```

## 📝 Licença

MIT
