import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import VueVirtualScroller from 'vue-virtual-scroller'
import ja from './locales/ja.json'
import en from './locales/en.json'
import './assets/main.css'
import { Locale } from '@/stores/locale'
import { isNumeric, ordinalSuffix } from '@/infrastructures/StringUtils'

type I18nFunctionMessageContext = { named: (value: string) => string }
const i18n = createI18n({
  locale: Locale.Ja,
  fallbackLocale: Locale.Ja,
  legacy: false,
  messages: {
    [Locale.Ja]: {
      ...ja,
      ordinal: (context: I18nFunctionMessageContext): string => `${context.named('number')}`
    },
    [Locale.En]: {
      ...en,
      ordinal: (context: I18nFunctionMessageContext): string => {
        const number = context.named('number')
        return isNumeric(number) ? ordinalSuffix(Number(number)) : number
      }
    }
  }
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(i18n)
app.use(pinia)
app.use(router)
app.use(VueVirtualScroller)

app.mount('#app')
