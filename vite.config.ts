import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.ts']
    })
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        keyboard: resolve(__dirname, 'src/keyboard.ts')
      },
      name: 'HumanLike',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'js' : 'es.js'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React'
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});