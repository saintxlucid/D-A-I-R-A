# Contributing to DAIRA

Thank you for your interest in contributing to DAIRA! We welcome contributions from developers, designers, and community members.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report**:
- Check the issue tracker for existing reports
- Verify the bug in the latest version
- Collect relevant information (logs, screenshots, steps to reproduce)

**Submitting a bug report**:
1. Use the bug report template
2. Include a clear title and description
3. Provide steps to reproduce
4. Share your environment details
5. Add screenshots if applicable

### Suggesting Features

We love new ideas! To suggest a feature:
1. Check if it's already been suggested
2. Use the feature request template
3. Explain the problem it solves
4. Describe your proposed solution
5. Consider alternatives

### Contributing Code

#### Getting Started

1. **Fork the repository**
   ```bash
   gh repo fork saintxlucid/D-A-I-R-A --clone
   cd D-A-I-R-A
   ```

2. **Set up your environment**
   ```bash
   # Install dependencies
   pnpm install
   
   # Set up environment
   cp infra/.env.example infra/.env
   
   # Start services
   docker compose -f infra/docker-compose.yml up -d
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Make your changes**
   - Write code following our style guides
   - Add tests for new functionality
   - Update documentation as needed

2. **Test your changes**
   ```bash
   # Run linters
   pnpm lint
   
   # Run tests
   pnpm test
   
   # Test locally
   pnpm dev
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   We use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

4. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   gh pr create
   ```

#### Pull Request Guidelines

**Before submitting**:
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commits follow conventional format
- [ ] Branch is up to date with main

**PR Description**:
- Clear title describing the change
- Reference related issues
- Describe what changed and why
- Include screenshots for UI changes
- Note breaking changes

**Review Process**:
1. Automated checks run (linting, tests, builds)
2. Maintainers review code
3. Address feedback
4. Approval from at least one maintainer
5. Merge!

## Development Guidelines

### Code Style

**TypeScript/JavaScript**:
- Use TypeScript for type safety
- Follow ESLint rules
- Use functional components in React
- Prefer const over let
- Use meaningful variable names

**Python**:
- Follow PEP 8
- Use type hints
- Maximum line length: 100
- Use Black for formatting
- Use Ruff for linting

### Testing

**Frontend Tests** (Vitest + Testing Library):
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

**Backend Tests** (pytest):
```python
def test_create_user(client):
    response = client.post('/graphql', json={
        'query': 'mutation { createUser(handle: "test", name: "Test") { id } }'
    })
    assert response.status_code == 200
    assert 'data' in response.json()
```

### Documentation

**When to update docs**:
- Adding new features
- Changing APIs
- Updating configuration
- Fixing bugs (if docs were wrong)

**Doc types**:
- Code comments: Why, not what
- README: High-level overview
- API docs: OpenAPI/GraphQL schema
- Guides: How-to documents

## Project Structure

```
D-A-I-R-A/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # FastAPI backend
├── packages/
│   ├── ui/           # Shared components
│   └── config/       # Shared configs
├── infra/            # Docker, deployment
├── docs/             # Documentation
└── .github/          # GitHub config
```

## Getting Help

**Questions?**
- Check the [documentation](docs/)
- Search existing issues
- Ask in discussions
- Join our Discord

**Need help with your PR?**
- Tag maintainers for review
- Ask specific questions
- Be patient - we're volunteers!

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor spotlight

## Legal

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making DAIRA better! 🎉
