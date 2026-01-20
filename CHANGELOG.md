# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added

- Core type-safe storage wrapper with schema validation
- Support for Zod, Valibot, Yup, and custom validators
- Version migrations for seamless schema upgrades
- TTL (Time-To-Live) support for automatic data expiration
- Cross-tab synchronization using storage events
- Smart serialization for Date, Map, and Set objects
- Graceful error handling with validation fallbacks
- React hooks integration (`useSafeStorage`)
- Vue composables integration (`useSafeStorage`)
- Comprehensive TypeScript types
- Full documentation with examples
- Zero dependencies in core package

### Features

- `createStore()` - Create type-safe storage stores
- `get()` - Retrieve validated data from storage
- `set()` - Store validated data
- `update()` - Update data with an updater function
- `remove()` - Remove data from storage
- `onUpdate()` - Subscribe to changes (including cross-tab)
- `has()` - Check if valid data exists
- `getRaw()` - Debug helper for raw data

### Framework Support

- React 16.8+ with hooks
- Vue 3+ with Composition API
- Vanilla JavaScript/TypeScript

### Developer Experience

- Full TypeScript support with strict mode
- Bundle size < 3kb (minified + gzipped)
- ESM and CommonJS builds
- Tree-shakeable exports
- Comprehensive examples and documentation
