<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="root-view-container">
    <div class="message">
      <h2>{{ t('concept') }}</h2>
      <p>{{ t('message-1') }}</p>
      <p>{{ t('message-2') }}</p>
      <p>{{ t('message-3') }}</p>
      <p>{{ t('message-4') }}</p>
    </div>
    <div class="menu-container">
      <router-link to="/concat" class="button menu-link">{{ $t('actions.concat') }}</router-link>
      <router-link to="/edit" class="button menu-link">{{ $t('actions.edit') }}</router-link>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "concept": "コンセプト",
  "message-1": "行数の多いCSVの編集作業を、Excelなどのツールで行うことは非常に大変です。",
  "message-2": "高速にCSVの編集作業を行えることを目的としたアプリがCSVSC(CSV Super Coordinator)です。",
  "message-3": "すべてのファイルはブラウザローカル上で処理され、サーバーにアップロードされることがありません。",
  "message-4": "そのため、ネットワークを介しての情報流出を懸念する必要がなく、安全にご利用いただけます。"
}
</i18n>
<i18n lang="json" locale="en">
{
  "concept": "concept",
  "message-1": "Editing large CSV files using tools like Excel can be quite challenging.",
  "message-2": "CSVSC (CSV Super Coordinator) is an application designed to enable fast and efficient editing of CSV files.",
  "message-3": "All files are processed on the browser locally and will never be uploaded to the server.",
  "message-4": "Therefore, you don't need to worry about information leaks through the network, and you can use it safely."
}
</i18n>

<style lang="scss" scoped>
.root-view-container {
  padding: 0 20px;
  .message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;

    h2 {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }
  }
  .menu-container {
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    column-gap: 20px;

    .menu-link {
      width: 200px;
    }
  }
}
</style>
