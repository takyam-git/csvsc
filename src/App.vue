<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <h1><router-link to="/">CSVSC</router-link></h1>
  </header>
  <RouterView />
</template>

<style lang="scss" scoped>
header {
  padding: 5px 20px;
  h1 {
    a {
      &:hover {
        text-decoration: none;
        background-color: var(--10-percente-white);
      }
    }
  }
}
</style>
