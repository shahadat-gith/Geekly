import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The admin console is its own app. Like the client it calls the API
// origin directly (VITE_API_URL) instead of using a Vite proxy.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    strictPort: true,
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
});
