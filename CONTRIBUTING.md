# Contributing to DAIRA

Thank you for your interest in contributing to DAIRA! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/D-A-I-R-A.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes using conventional commits (see below)
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm 8+
- Docker and Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
docker compose up -d  # Start infrastructure
pnpm dev              # Start web and api in development mode
```

## Conventional Commits

We use conventional commits for clear git history. Format: `type(scope): message`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

Examples:
```
feat(api): add user authentication endpoint
fix(web): resolve layout issue on mobile
docs: update installation instructions
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript for type safety
- Follow ESLint configuration
- Run `pnpm lint` before committing
- Format with Prettier: `pnpm format`

### Python
- Follow PEP 8 guidelines
- Use type hints
- Format with Black: `black .`
- Lint with Ruff: `ruff check .`

## Testing

- Write tests for new features
- Ensure all tests pass: `pnpm test`
- Aim for good test coverage

### Web Tests
```bash
cd apps/web
npm test
```

### API Tests
```bash
cd apps/api
pytest
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Ensure linting passes
5. Update the README.md if needed
6. Request review from maintainers

## Code Review

- Be respectful and constructive
- Address all review comments
- Keep PRs focused and small when possible

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
