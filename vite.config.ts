import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/CNAME',
          dest: '.'
        }
      ]
    }),
    VueI18nPlugin.vite({
      /* options */
      // locale messages resource pre-compile option
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**')
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        concat: 'concat/index.html',
        edit: 'edit/index.html'
      }
    }
  }
})
