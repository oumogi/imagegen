import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the process.env.API_KEY usage in the code to work after build
    // It replaces it with the actual string from the environment variable during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});