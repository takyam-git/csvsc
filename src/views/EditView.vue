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
    <drag-and-drop-csv-files v-if="!csvFile" is-single @load="onLoadCsvFiles" />
    <file-card v-if="csvFile" :csv-file="csvFile" @clear="csvFile = null" />
  </div>
</template>

<style lang="scss" scoped>
.editor-container {
  padding: 0 30px;
}
</style>
