<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Locale, useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import type { Option } from '@/components/forms/SelectBox.vue'
import SelectBox from '@/components/forms/SelectBox.vue'
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import 'dayjs/locale/es-us'

const { locale, setLocale, isValidLocale } = useLocaleStore()
const i18n = useI18n()
i18n.locale.value = locale
dayjs.locale(locale === Locale.Ja ? 'ja' : 'en-us')

const localeOptions = computed<Option[]>(() => [
  { label: '🇯🇵 日本語', value: Locale.Ja },
  { label: '🇺🇸 English', value: Locale.En }
])

const onChangeLocale = (newLocale: string): void => {
  if (isValidLocale(newLocale)) {
    setLocale(newLocale)
    dayjs.locale(locale === Locale.Ja ? 'ja' : 'en-us')
    i18n.locale.value = newLocale
  }
}
</script>

<template>
  <header>
    <h1><router-link to="/">CSVSC</router-link></h1>
    <select-box :options="localeOptions" :value="locale" @change="onChangeLocale" />
  </header>
  <RouterView />
</template>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;

  h1 {
    a {
      &:hover {
        text-decoration: none;
        background-color: var(--10-percente-white);
      }
    }
  }

  .locale-selector {
    background-color: var(--vt-c-black-soft);
    color: var(--color-text);
    padding: 3px 5px;
    border-radius: 4px;
    cursor: pointer;

    .locale-select {
    }
  }
}
</style>
