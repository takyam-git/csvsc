import { ref } from 'vue'
import { defineStore } from 'pinia'

export enum Locale {
  Ja = 'ja',
  En = 'en'
}

export const useLocaleStore = defineStore(
  'locale',
  () => {
    const locale = ref(Locale.Ja)

    const setLocale = (newLocale: Locale) => {
      locale.value = newLocale
    }

    const isValidLocale = (newLocale: string): newLocale is Locale =>
      Object.values(Locale).includes(newLocale as Locale)

    return { locale, setLocale, isValidLocale }
  },
  {
    persist: true
  }
)
