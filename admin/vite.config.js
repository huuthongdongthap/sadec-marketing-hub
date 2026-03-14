import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 3001,
        host: true
    },
    build: {
        outDir: 'dist',
        sourcemap: false, // Disable sourcemap for production to reduce bundle size
        minify: 'esbuild', // Faster minifier
        cssCodeSplit: true,
        target: 'esnext', // Modern browser target for smaller bundle
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    charts: ['recharts'],
                    icons: ['lucide-react']
                }
            }
        },
        // Enable compression report
        reportCompressedSize: true
    },
    // Performance optimizations
    optimizeDeps: {
        include: ['react', 'react-dom', 'recharts', 'lucide-react']
    },
    // Test configuration
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './src/test/setup.ts',
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
    }
});
