import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/widget.jsx',
      name: 'SavannaOnboardingWidget',
      formats: ['iife'],
      fileName: () => 'savanna-onboarding-widget.js',
    },
  },
});
