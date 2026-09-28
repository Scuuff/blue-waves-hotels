import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// `--mode demo` builds the GitHub Pages version: served from /blue-waves-hotels/
// with the API running in the browser (see src/demo).
const PAGES_BASE = '/blue-waves-hotels/';

// GitHub Pages has no SPA rewrites, so serve the app for unknown paths too.
const spaFallback = {
  name: 'spa-404-fallback',
  apply: 'build',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
    fs.writeFileSync(path.join(dist, '.nojekyll'), '');
  },
};

export default defineConfig(({ mode }) => {
  const demo = mode === 'demo';

  return {
    base: demo ? PAGES_BASE : '/',
    plugins: [react(), tailwindcss(), demo && spaFallback],
    define: demo ? { 'import.meta.env.VITE_DEMO_MODE': JSON.stringify('true') } : {},
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
  };
});
