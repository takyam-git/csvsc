<script setup lang="ts">
import { ref } from 'vue'
import DragAndDropCsvFiles from '@/components/files/DragAndDropCsvFiles.vue'
import type { CsvFile as BaseCsvFile } from '@/components/files/DragAndDropCsvFiles.type'
import FileCard from '@/components/files/FileCard.vue'

type CsvFile = {} & BaseCsvFile

const csvFile = ref<CsvFile | null>(null)

const onLoadCsvFiles = (baseCsvFiles: BaseCsvFile[]) => {
  csvFile.value = baseCsvFiles[0] ?? null
}
</script>

<template>
  <div class="editor-container">
    <div class="file-container">
      <drag-and-drop-csv-files v-if="!csvFile" is-single @load="onLoadCsvFiles" />
      <file-card v-if="csvFile" :csv-file="csvFile" @clear="csvFile = null" />
    </div>
    <div v-if="csvFile" class="actions-container">
      <button class="button">行フィルタ</button>
      <button class="button">列フィルタ</button>
      <button class="button">置換</button>
      <button class="button">列追加</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor-container {
  padding: 0 30px;

  .file-container {
    margin-bottom: 20px;
  }

  .actions-container {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 10px;

    button.button {
      width: 150px;
    }
  }
}
</style>
