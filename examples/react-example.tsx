/**
 * React example using SafeStorage
 */

import React from 'react';
import { z } from 'zod';
import { useSafeStorage, createStorageHook } from '../src/react';

// Example 1: Basic usage
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

function UserProfile() {
  const [user, setUser, { remove, update, isLoading }] = useSafeStorage({
    key: 'user',
    schema: userSchema,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <p>Age: {user.age}</p>
          <button
            onClick={() =>
              update((current) => ({
                ...current!,
                age: current!.age + 1,
              }))
            }
          >
            Increment Age
          </button>
          <button onClick={remove}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Not logged in</h2>
          <button
            onClick={() =>
              setUser({
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
              })
            }
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}

// Example 2: Creating a reusable hook
const themeSchema = z.enum(['light', 'dark']);

export const useTheme = createStorageHook({
  key: 'theme',
  schema: themeSchema,
  defaultValue: 'light' as const,
});

function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();

  React.useEffect(() => {
    document.body.setAttribute('data-theme', theme || 'light');
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? ('dark' as const) : ('light' as const))}
    >
      Toggle Theme (Current: {theme})
    </button>
  );
}

// Example 3: Shopping cart with complex operations
const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
});

const cartSchema = z.array(cartItemSchema);

type CartItem = z.infer<typeof cartItemSchema>;

function ShoppingCart() {
  const [cart, setCart, { update }] = useSafeStorage<CartItem[]>({
    key: 'cart',
    schema: cartSchema,
    defaultValue: [],
  });

  const addItem = (item: z.infer<typeof cartItemSchema>) => {
    update((current) => {
      const existing = current?.find((i) => i.id === item.id);
      if (existing) {
        return current!.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...(current || []), item];
    });
  };

  const removeItem = (id: string) => {
    update((current) => current?.filter((i) => i.id !== id) || []);
  };

  const total = cart?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart?.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div>
          {cart?.map((item) => (
            <div key={item.id}>
              <span>
                {item.name} x {item.quantity} = ${item.price * item.quantity}
              </span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <div>
            <strong>Total: ${total?.toFixed(2)}</strong>
          </div>
        </div>
      )}
      <button
        onClick={() =>
          addItem({
            id: Date.now().toString(),
            name: 'Sample Product',
            quantity: 1,
            price: 19.99,
          })
        }
      >
        Add Sample Item
      </button>
    </div>
  );
}

// Example 4: Form with auto-save
const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

function AutoSaveForm() {
  const [formData, setFormData] = useSafeStorage({
    key: 'draft-form',
    schema: formSchema,
    defaultValue: {
      title: '',
      description: '',
      tags: [],
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // Clear draft after submission
    setFormData({ title: '', description: '', tags: [] });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData?.title}
        onChange={(e) =>
          setFormData({ ...formData!, title: e.target.value })
        }
        placeholder="Title"
      />
      <textarea
        value={formData?.description}
        onChange={(e) =>
          setFormData({ ...formData!, description: e.target.value })
        }
        placeholder="Description"
      />
      <button type="submit">Submit</button>
      <p>
        <small>Form auto-saves to localStorage</small>
      </p>
    </form>
  );
}

// Main App
export function App() {
  return (
    <div>
      <h1>SafeStorage React Examples</h1>
      <hr />
      <UserProfile />
      <hr />
      <ThemeSwitcher />
      <hr />
      <ShoppingCart />
      <hr />
      <AutoSaveForm />
    </div>
  );
}
