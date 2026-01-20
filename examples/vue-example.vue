<script setup lang="ts">
/**
 * Vue example using SafeStorage
 */

import { z } from 'zod';
import { computed } from 'vue';
import { useSafeStorage, createStorageComposable } from '../src/vue';

// Example 1: Basic user profile
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

const {
  value: user,
  set: setUser,
  update: updateUser,
  remove: removeUser,
  isLoading: userLoading,
} = useSafeStorage({
  key: 'user',
  schema: userSchema,
});

function login() {
  setUser({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  });
}

function incrementAge() {
  updateUser((current) => ({
    ...current!,
    age: current!.age + 1,
  }));
}

// Example 2: Theme switcher with reusable composable
const themeSchema = z.enum(['light', 'dark']);

const useTheme = createStorageComposable({
  key: 'theme',
  schema: themeSchema,
  defaultValue: 'light' as const,
});

const { value: theme, set: setTheme } = useTheme();

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
}

// Example 3: Shopping cart
const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
});

const cartSchema = z.array(cartItemSchema);

const { value: cart, update: updateCart } = useSafeStorage({
  key: 'cart',
  schema: cartSchema,
  defaultValue: [],
});

function addToCart() {
  const newItem = {
    id: Date.now().toString(),
    name: 'Sample Product',
    quantity: 1,
    price: 19.99,
  };

  updateCart((current) => {
    const existing = current?.find((i) => i.id === newItem.id);
    if (existing) {
      return current!.map((i) =>
        i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...(current || []), newItem];
  });
}

function removeFromCart(id: string) {
  updateCart((current) => current?.filter((i) => i.id !== id) || []);
}

const cartTotal = computed(() =>
  cart.value?.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// Example 4: Auto-save form
const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

const { value: formData, set: setFormData } = useSafeStorage({
  key: 'draft-form',
  schema: formSchema,
  defaultValue: {
    title: '',
    description: '',
    tags: [],
  },
});

function handleSubmit() {
  console.log('Submitting:', formData.value);
  // Clear draft after submission
  setFormData({ title: '', description: '', tags: [] });
}
</script>

<template>
  <div class="app">
    <h1>SafeStorage Vue Examples</h1>

    <!-- Example 1: User Profile -->
    <section>
      <h2>User Profile</h2>
      <div v-if="userLoading">Loading...</div>
      <div v-else-if="user">
        <p>Name: {{ user.name }}</p>
        <p>Email: {{ user.email }}</p>
        <p>Age: {{ user.age }}</p>
        <button @click="incrementAge">Increment Age</button>
        <button @click="removeUser">Logout</button>
      </div>
      <div v-else>
        <p>Not logged in</p>
        <button @click="login">Login</button>
      </div>
    </section>

    <hr />

    <!-- Example 2: Theme Switcher -->
    <section>
      <h2>Theme Switcher</h2>
      <p>Current theme: {{ theme }}</p>
      <button @click="toggleTheme">
        Toggle Theme
      </button>
    </section>

    <hr />

    <!-- Example 3: Shopping Cart -->
    <section>
      <h2>Shopping Cart</h2>
      <div v-if="cart && cart.length === 0">
        <p>Cart is empty</p>
      </div>
      <div v-else>
        <div v-for="item in cart" :key="item.id" class="cart-item">
          <span>
            {{ item.name }} x {{ item.quantity }} = ${{ (item.price * item.quantity).toFixed(2) }}
          </span>
          <button @click="removeFromCart(item.id)">Remove</button>
        </div>
        <div class="cart-total">
          <strong>Total: ${{ cartTotal?.toFixed(2) }}</strong>
        </div>
      </div>
      <button @click="addToCart">Add Sample Item</button>
    </section>

    <hr />

    <!-- Example 4: Auto-save Form -->
    <section>
      <h2>Auto-save Form</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <input
            v-model="formData!.title"
            placeholder="Title"
            type="text"
          />
        </div>
        <div>
          <textarea
            v-model="formData!.description"
            placeholder="Description"
          />
        </div>
        <button type="submit">Submit</button>
        <p><small>Form auto-saves to localStorage</small></p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin: 20px 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px 0;
}

.cart-total {
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
}

button {
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
}
</style>
