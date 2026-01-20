/**
 * ESLint plugin for SafeStorage
 * Catches localStorage/sessionStorage usage and suggests SafeStorage
 */

module.exports = {
  rules: {
    'no-direct-storage': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow direct localStorage/sessionStorage usage',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          noDirectStorage:
            'Avoid using {{ storage }} directly. Use SafeStorage for type-safe storage with validation.',
        },
      },
      create(context) {
        return {
          MemberExpression(node) {
            // Check for localStorage.* or sessionStorage.*
            if (
              node.object.type === 'Identifier' &&
              (node.object.name === 'localStorage' ||
                node.object.name === 'sessionStorage')
            ) {
              context.report({
                node,
                messageId: 'noDirectStorage',
                data: {
                  storage: node.object.name,
                },
              });
            }

            // Check for window.localStorage.* or window.sessionStorage.*
            if (
              node.object.type === 'MemberExpression' &&
              node.object.object.type === 'Identifier' &&
              node.object.object.name === 'window' &&
              node.object.property.type === 'Identifier' &&
              (node.object.property.name === 'localStorage' ||
                node.object.property.name === 'sessionStorage')
            ) {
              context.report({
                node,
                messageId: 'noDirectStorage',
                data: {
                  storage: node.object.property.name,
                },
              });
            }
          },
        };
      },
    },

    'require-schema-validation': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require schema validation when using createStore',
          category: 'Possible Errors',
          recommended: true,
        },
        schema: [],
        messages: {
          missingSchema: 'createStore requires a schema for validation',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'createStore'
            ) {
              // Check if schema is provided
              const arg = node.arguments[0];
              if (
                !arg ||
                arg.type !== 'ObjectExpression' ||
                !arg.properties.some(
                  (prop) =>
                    prop.type === 'Property' &&
                    prop.key.type === 'Identifier' &&
                    prop.key.name === 'schema'
                )
              ) {
                context.report({
                  node,
                  messageId: 'missingSchema',
                });
              }
            }
          },
        };
      },
    },

    'prefer-default-value': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer providing defaultValue to avoid null checks',
          category: 'Best Practices',
          recommended: false,
        },
        schema: [],
        messages: {
          addDefaultValue:
            'Consider adding a defaultValue to avoid null checks',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'createStore'
            ) {
              const arg = node.arguments[0];
              if (arg && arg.type === 'ObjectExpression') {
                const hasDefaultValue = arg.properties.some(
                  (prop) =>
                    prop.type === 'Property' &&
                    prop.key.type === 'Identifier' &&
                    prop.key.name === 'defaultValue'
                );

                if (!hasDefaultValue) {
                  context.report({
                    node,
                    messageId: 'addDefaultValue',
                  });
                }
              }
            }
          },
        };
      },
    },
  },

  configs: {
    recommended: {
      plugins: ['safe-storage'],
      rules: {
        'safe-storage/no-direct-storage': 'warn',
        'safe-storage/require-schema-validation': 'error',
      },
    },
    strict: {
      plugins: ['safe-storage'],
      rules: {
        'safe-storage/no-direct-storage': 'error',
        'safe-storage/require-schema-validation': 'error',
        'safe-storage/prefer-default-value': 'warn',
      },
    },
  },
};
