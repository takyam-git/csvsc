<script setup lang="ts"></script>

<template>
  <div class="menu-container">
    <router-link to="/concat" class="button menu-link">結合する</router-link>
    <router-link to="/edit" class="button menu-link">編集する</router-link>
  </div>
</template>

<style lang="scss" scoped>
.menu-container {
  padding: 0 20px;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  column-gap: 20px;

  .menu-link {
    width: 200px;
  }
}
</style>
