# @daira/ui

Shared React component library for DAIRA applications.

## Overview

A collection of reusable, accessible React components built with Tailwind CSS and inspired by shadcn/ui. This package provides consistent UI elements across all DAIRA applications.

## Components

### Button

A versatile button component with multiple variants and sizes.

#### Usage

```tsx
import { Button } from '@daira/ui';

function MyComponent() {
  return (
    <>
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </>
  );
}
```

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}
```

#### Variants
- **default**: Primary button with background color
- **outline**: Transparent with border
- **ghost**: Minimal styling with hover effect

#### Sizes
- **sm**: Small (h-9, px-3)
- **default**: Medium (h-10, px-4)
- **lg**: Large (h-11, px-8)

### Card

Container components for content grouping.

#### Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@daira/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  );
}
```

#### Components

- **Card**: Root container with border and shadow
- **CardHeader**: Header section with padding
- **CardTitle**: Styled heading for card
- **CardContent**: Main content area

## Utilities

### `cn(...inputs: ClassValue[])`

Utility function for merging Tailwind CSS classes. Combines `clsx` and `tailwind-merge` for optimal class management.

```tsx
import { cn } from '@daira/ui';

function MyComponent({ className }) {
  return (
    <div className={cn('base-classes', className)}>
      Content
    </div>
  );
}
```

## Installation

This is a workspace package. Install dependencies from the monorepo root:

```bash
pnpm install
```

## Development

### Scripts

```bash
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript type checking
```

### Adding New Components

1. Create component file in `src/components/`
2. Export from `src/index.tsx`
3. Document in this README
4. Add Storybook story (future)

## Project Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx    # Button component
│   │   └── card.tsx      # Card components
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   └── index.tsx         # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## Styling

Components use Tailwind CSS with the following approach:

- **Base styles**: Applied to all component variants
- **Variant styles**: Conditional classes based on props
- **Merge utility**: `cn()` function for class merging
- **CSS variables**: Theme colors from consuming app

## TypeScript

Fully typed with TypeScript:
- Component props interfaces
- Forwarded refs
- Utility function types

## Dependencies

### Core
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

### Styling
- `tailwind-merge`: ^2.2.0
- `clsx`: ^2.0.0
- `class-variance-authority`: ^0.7.0

### Dev Dependencies
- `typescript`: ^5.3.3
- `@types/react`: ^18.2.45
- `@types/react-dom`: ^18.2.18
- `eslint`: ^8.56.0
- `eslint-config-next`: ^14.0.4

## Design Tokens

Components inherit design tokens from the consuming application:
- Colors (primary, accent, border, etc.)
- Spacing
- Border radius
- Shadows
- Typography

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Focus visible styles
- Screen reader friendly

## Best Practices

### Component Guidelines
1. Keep components simple and focused
2. Use TypeScript for type safety
3. Forward refs when appropriate
4. Provide sensible defaults
5. Document all props
6. Follow naming conventions

### Style Guidelines
1. Use Tailwind utility classes
2. Avoid custom CSS when possible
3. Use `cn()` for class merging
4. Keep specificity low
5. Support dark mode (future)

## Testing

Component testing setup (future):
- React Testing Library
- Jest
- Storybook for visual testing

## Future Enhancements

- [ ] More components (Input, Select, Dialog, etc.)
- [ ] Storybook integration
- [ ] Component tests
- [ ] Dark mode support
- [ ] Animation utilities
- [ ] Form components
- [ ] Table components
- [ ] Modal/Dialog system
- [ ] Toast notifications
- [ ] Dropdown menus

## Usage in Applications

### Web App

```tsx
// apps/web/src/app/page.tsx
import { Button, Card, CardContent } from '@daira/ui';

export default function Page() {
  return (
    <Card>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Configuration

Ensure `transpilePackages` is set in Next.js config:

```js
// next.config.js
module.exports = {
  transpilePackages: ['@daira/ui'],
};
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types
3. Update documentation
4. Test in consuming applications
5. Submit PR with clear description

## License

MIT - See LICENSE file in repository root
