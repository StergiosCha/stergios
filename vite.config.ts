import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// served at https://stergioscha.github.io/literature/  (custom domain later: base '/')
export default defineConfig({ base: '/stergios/', plugins: [react()], build: { target: 'es2020', rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] } } } } });
