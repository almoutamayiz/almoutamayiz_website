import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      target: 'esnext'
    },
    server: {
      port: 3000
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY),
      // Expose rotation keys dynamically
      ...Object.keys(env).reduce((prev, key) => {
        if (key.startsWith('VITE_API_KEY_')) {
          prev[`process.env.${key}`] = JSON.stringify(env[key]);
        }
        return prev;
      }, {} as Record<string, string>)
    }
  };
});