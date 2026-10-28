import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// served at https://stergios.chatzikyriakidis.org/
export default defineConfig({ base: '/', plugins: [react()], build: { target: 'es2020', rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] } } } } });
