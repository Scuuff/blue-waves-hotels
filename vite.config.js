import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // Force single React instance
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion/dist/cjs/index.js'),
      '@reduxjs/toolkit': path.resolve(__dirname, 'node_modules/@reduxjs/toolkit/dist/cjs/index.js'),
    },
  },
});
