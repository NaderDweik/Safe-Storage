# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

Security vulnerabilities should not be publicly disclosed until they have been addressed.

### 2. Report via Email

Send details to: [your-security-email@example.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. What to Expect

- **Response time**: Within 48 hours
- **Update frequency**: Every 7 days until resolved
- **Resolution timeline**: 30-90 days depending on severity

### 4. Disclosure Policy

- We will coordinate with you on the disclosure timeline
- Credit will be given for responsible disclosure
- Security advisories will be published after fixes are released

## Security Best Practices

When using SafeStorage:

1. **Never store sensitive data without encryption**
   ```typescript
   // Bad
   const store = createStore({ key: 'password', schema: z.string() });
   
   // Good - use encryption
   const store = createStore({
     key: 'password',
     schema: z.string(),
     serializer: encryptedSerializer,
   });
   ```

2. **Validate all data from storage**
   - SafeStorage does this automatically with schemas
   - Always provide `onValidationError` handler

3. **Use TTL for sensitive session data**
   ```typescript
   const sessionStore = createStore({
     key: 'session',
     schema: sessionSchema,
     ttl: 1000 * 60 * 30, // 30 minutes
   });
   ```

4. **Be cautious with cross-tab sync**
   - Understand that data can change from other tabs
   - Implement proper conflict resolution

## Known Limitations

- localStorage is not encrypted by default
- Data is accessible via browser DevTools
- 5-10MB storage limit per origin
- Synchronous API can block the main thread with large data

## Secure Coding Guidelines

Contributors should:
- Never use `eval()` or `Function()` constructor
- Sanitize all user input before storage
- Use Content Security Policy (CSP) in examples
- Follow OWASP guidelines for web storage

Thank you for helping keep SafeStorage secure!
