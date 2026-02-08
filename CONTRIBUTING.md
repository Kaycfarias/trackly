# Contributing to Trackly SDK

## 🚀 Quick Start

```bash
# Clone e setup
git clone https://github.com/kaycfarias/trackly.git
cd trackly
pnpm install
pnpm build

# Development
pnpm dev  # Watch mode para ambos packages
```

## 📦 Estrutura do Projeto

```
trackly/
├── packages/
│   ├── sdk/              # trackly-sdk (core)
│   │   ├── src/
│   │   │   ├── types.ts      # Definições de tipos
│   │   │   ├── tracker.ts    # Analytics class principal
│   │   │   ├── queue.ts      # Event batching
│   │   │   ├── transport.ts  # HTTP + sendBeacon
│   │   │   └── index.ts      # Exports públicos
│   │   └── dist/             # Build output
│   └── react/            # trackly-react
│       ├── src/
│       │   ├── AnalyticsProvider.tsx
│       │   ├── hooks.ts
│       │   ├── components.tsx
│       │   └── index.ts
│       └── dist/
├── .github/
│   └── copilot-instructions.md
└── package.json
```

## 🛠️ Desenvolvimento

### Workflow

1. **Fazer mudanças** no código fonte (`packages/*/src/`)
2. **Build** com `pnpm build` (ou deixe `pnpm dev` rodando)
3. **Testar** localmente usando `yalc` ou `file:` protocol
4. **Commit** seguindo Conventional Commits

### Commands

```bash
# Build
pnpm build              # Build todos packages
pnpm --filter trackly-sdk build
pnpm --filter trackly-react build

# Dev mode
pnpm dev                # Watch mode paralelo

# Clean
pnpm clean              # Remove dist/ e cache
```

### Testing Local em Outros Projetos

**Opção 1: yalc (Recomendado)**

```bash
# No trackly/
npm install -g yalc
pnpm build
cd packages/sdk && yalc publish
cd ../react && yalc publish

# No seu projeto
yalc add trackly-sdk trackly-react
```

**Opção 2: file: protocol**

```bash
# No seu projeto
npm install file:../trackly/packages/sdk
npm install file:../trackly/packages/react
```

## 📝 Convenções de Código

### TypeScript

- **Strict mode** habilitado
- Use `??` para defaults, nunca `||`
- Sempre type annotations explícitas em exports públicas
- Target: ES2015 para compatibilidade browser

### Patterns Importantes

#### 1. Dependency Injection

```typescript
// ✅ Correto
constructor(transport: Transport, batchSize: number = 10) {
  this.transport = transport;
}

// ❌ Evitar
constructor() {
  this.transport = new Transport(...);
}
```

#### 2. Config com Defaults

```typescript
// Usar ?? para preservar valores falsy
this.config = {
  apiUrl: config.apiUrl,
  batchSize: config.batchSize ?? 10,
  debug: config.debug ?? false,
};
```

#### 3. React Hooks

```typescript
// Sempre deps array explícito
useEffect(() => {
  analytics.track(eventName, properties);
}, [analytics, eventName, ...deps]);
```

## 🔄 Release Process

### 1. Atualizar Versões

```bash
# Bump versions manualmente em package.json de cada package
# Ou use changesets (se configurado)
```

### 2. Build e Publicar

```bash
pnpm build

# SDK primeiro (React depende dele)
cd packages/sdk
npm publish

cd ../react
npm publish
```

### 3. Tag no Git

```bash
git tag v0.2.0
git push origin main --tags
```

## 🐛 Debugging

### Enable Debug Logs

```typescript
const analytics = new Analytics({
  apiUrl: "...",
  debug: true, // ✅ Ativa logs [Analytics]
});
```

### Common Issues

**Build errors:**
```bash
pnpm clean && pnpm install && pnpm build
```

**TypeScript não reconhece tipos:**
```bash
# Rebuild e restart TS server no editor
pnpm build
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Workspace dependency issues:**
```bash
pnpm install --force
```

## 📚 Recursos

- [Main README](../README.md)
- [SDK README](packages/sdk/README.md)
- [React README](packages/react/README.md)
- [Copilot Instructions](.github/copilot-instructions.md)

## 🤝 Pull Request Process

1. Fork o repositório
2. Crie branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adicionar funcionalidade X'`
4. Push: `git push origin feature/minha-feature`
5. Abra PR no GitHub

### Commit Convention

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Bug fix
- `docs:` Mudanças em documentação
- `refactor:` Refatoração de código
- `test:` Adicionar/atualizar testes
- `chore:` Tarefas de manutenção

**Exemplos:**
```
feat(sdk): adicionar suporte para custom headers
fix(react): corrigir memory leak no usePageview
docs: atualizar exemplos de uso no README
```

## 📄 Licença

MIT - veja [LICENSE](../LICENSE)
