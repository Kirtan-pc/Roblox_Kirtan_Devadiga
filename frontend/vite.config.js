import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite configuration for the Echo frontend.
// Reserved for Milestone 3 - no routing, proxy, or extra plugins yet.
export default defineConfig({
  plugins: [react()],
});
