# eslint-plugin-safe-storage

ESLint plugin to enforce SafeStorage best practices and catch direct localStorage usage.

## Installation

```bash
npm install --save-dev eslint-plugin-safe-storage
```

## Usage

Add to your `.eslintrc`:

```json
{
  "plugins": ["safe-storage"],
  "extends": ["plugin:safe-storage/recommended"]
}
```

## Rules

### `no-direct-storage` (recommended)

Disallow direct `localStorage` or `sessionStorage` usage.

❌ Bad:
```javascript
localStorage.setItem('key', 'value');
const data = JSON.parse(localStorage.getItem('key'));
```

✅ Good:
```javascript
import { createStore } from 'safe-storage';
const store = createStore({ key: 'data', schema: mySchema });
store.set(value);
```

### `require-schema-validation` (recommended)

Require schema validation when using `createStore`.

❌ Bad:
```javascript
const store = createStore({ key: 'data' }); // No schema!
```

✅ Good:
```javascript
const store = createStore({
  key: 'data',
  schema: z.object({ name: z.string() }),
});
```

### `prefer-default-value`

Suggest adding `defaultValue` to avoid null checks.

⚠️ Warning:
```javascript
const store = createStore({
  key: 'data',
  schema: mySchema,
  // Consider adding: defaultValue: {...}
});
```

## Configurations

### `recommended`
```json
{
  "extends": ["plugin:safe-storage/recommended"]
}
```

### `strict`
```json
{
  "extends": ["plugin:safe-storage/strict"]
}
```

## License

MIT
