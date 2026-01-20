# Contributing to SafeStorage

Thank you for considering contributing to SafeStorage! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/safe-storage.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

### Setup

```bash
npm install
npm run dev  # Watch mode for development
```

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Code Style

- Use TypeScript strict mode
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Never use the `any` type

## Commit Guidelines

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example:
```
feat: add support for custom serializers
fix: resolve cross-tab sync race condition
docs: update API reference for migrations
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Update CHANGELOG.md
5. Ensure TypeScript types are correct
6. Make sure bundle size doesn't increase significantly

## Project Structure

```
src/
├── core/          # Core storage logic
│   ├── store.ts   # Main store implementation
│   └── serializer.ts # Serialization utilities
├── react/         # React integration
│   └── index.ts   # React hooks
├── vue/           # Vue integration
│   └── index.ts   # Vue composables
├── types/         # TypeScript types
│   └── index.ts   # Type definitions
└── index.ts       # Main exports
```

## Adding New Features

When adding new features:

1. Start with the core implementation in `src/core/`
2. Add TypeScript types in `src/types/`
3. Update React/Vue integrations if needed
4. Add tests
5. Update documentation
6. Add examples in `examples/`

## Testing

- Write unit tests for all new functionality
- Test edge cases and error conditions
- Test cross-tab synchronization
- Test with different validators (Zod, Valibot, Yup)

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to public APIs
- Provide code examples
- Update CHANGELOG.md

## Performance

- Keep bundle size minimal (< 3kb for core)
- Avoid unnecessary dependencies
- Use efficient algorithms
- Profile performance-critical code

## Questions?

Feel free to open an issue for discussion before starting work on major changes.

## Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
