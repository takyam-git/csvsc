<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Locale, useLocaleStore } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
const { locale, setLocale, isValidLocale } = useLocaleStore()
const i18n = useI18n()
i18n.locale.value = locale

const onChangeLocale = (e: Event & { target: HTMLSelectElement }): void => {
  const value = e.target.value
  if (isValidLocale(value)) {
    setLocale(value)
    i18n.locale.value = value
  }
}
</script>

<template>
  <header>
    <h1><router-link to="/">CSVSC</router-link></h1>
    <select class="locale-selector" :value="locale" @change="onChangeLocale">
      <option class="locale-select" :value="Locale.Ja">🇯🇵 日本語</option>
      <option class="locale-select" :value="Locale.En">🇺🇸 English</option>
    </select>
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
