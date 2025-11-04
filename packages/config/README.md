# @daira/config

Shared configuration files for DAIRA monorepo.

## Overview

Centralized ESLint, Prettier, and TypeScript configurations used across all packages and applications in the DAIRA monorepo. This ensures consistent code style, linting rules, and type checking across the entire codebase.

## Contents

### ESLint Configuration

**File**: `eslint-preset.js`

Base ESLint configuration extending Next.js and Turbo presets.

#### Usage

```js
// .eslintrc.js in any package
module.exports = {
  root: true,
  extends: ['@daira/config/eslint-preset.js'],
};
```

#### Rules

The configuration includes:
- Next.js recommended rules
- Turbo monorepo optimizations
- Prettier integration
- TypeScript support
- React best practices

#### Disabled Rules

- `@next/next/no-html-link-for-pages`: Disabled for flexibility in monorepo structure

### TypeScript Configuration

**File**: `typescript.json`

Base TypeScript configuration for the monorepo.

#### Usage

```json
{
  "extends": "@daira/config/typescript.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Configuration

```json
{
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "incremental": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}
```

## Installation

This is a workspace package. Install from monorepo root:

```bash
pnpm install
```

## Usage in Applications

### Web App

```js
// apps/web/.eslintrc.js
module.exports = {
  root: true,
  extends: ['next'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
```

```json
// apps/web/tsconfig.json
{
  "extends": "@daira/config/typescript.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### API App

TypeScript configuration is not used in the Python API app, but ESLint concepts can be adapted for Python linting tools like Ruff.

### Packages

```js
// packages/ui/.eslintrc.js
module.exports = {
  root: true,
  extends: ['next'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
```

## Customization

### Extending ESLint

Add package-specific rules while keeping base configuration:

```js
module.exports = {
  root: true,
  extends: ['@daira/config/eslint-preset.js'],
  rules: {
    // Add your custom rules here
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
```

### Extending TypeScript

Override specific compiler options:

```json
{
  "extends": "@daira/config/typescript.json",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Configuration Philosophy

### Strict Type Checking

- `strict: true` - Enable all strict type checking options
- `strictNullChecks: true` - Ensure null/undefined are handled
- `forceConsistentCasingInFileNames: true` - Prevent casing issues

### Modern JavaScript

- `target: ES2020` - Use modern JavaScript features
- `module: ESNext` - ES modules
- `moduleResolution: node` - Node-style resolution

### Developer Experience

- `skipLibCheck: true` - Faster builds
- `incremental: true` - Faster rebuilds
- `preserveWatchOutput: true` - Better watch mode
- `isolatedModules: true` - Better for bundlers

## Best Practices

### TypeScript

1. Enable strict mode
2. Use explicit types for public APIs
3. Avoid `any` type
4. Use `unknown` for truly unknown types
5. Leverage type inference where possible

### ESLint

1. Fix all errors before committing
2. Address warnings when possible
3. Use inline disables sparingly
4. Document why rules are disabled
5. Run lint as part of CI

### Prettier

1. Use consistent formatting across all files
2. Let Prettier handle formatting
3. Don't fight with Prettier
4. Configure editor to format on save
5. Use pre-commit hooks

## Scripts

No scripts are needed in this package as it only provides configuration files.

## Dependencies

None - this package only contains configuration files.

## Future Enhancements

- [ ] Add Prettier configuration file
- [ ] Add Jest configuration
- [ ] Add Storybook configuration
- [ ] Add custom ESLint rules
- [ ] Add plugin configurations
- [ ] Add environment-specific configs
- [ ] Add import sorting rules

## Troubleshooting

### ESLint Not Finding Config

Ensure the package is properly installed in the workspace:

```bash
pnpm install
```

### TypeScript Errors

1. Check that the base config is properly extended
2. Verify paths are configured correctly
3. Run `pnpm typecheck` to see all errors
4. Clear TypeScript cache: `rm -rf .turbo`

### Conflicting Rules

If you have conflicts between ESLint and Prettier:

1. Ensure `eslint-config-prettier` is installed
2. Prettier should be last in extends array
3. Use `eslint --fix` to auto-fix issues

## Contributing

When updating shared configurations:

1. Test changes across all packages
2. Run linting and type checking
3. Update this documentation
4. Notify team of breaking changes
5. Version bump if needed

## Versioning

This package follows the monorepo version. Breaking changes should be:
1. Documented in CHANGELOG
2. Communicated to team
3. Applied with migration guide if needed

## License

MIT - See LICENSE file in repository root
