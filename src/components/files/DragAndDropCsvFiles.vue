<script setup lang="ts">
import { defineProps, ref, withDefaults } from 'vue'
import { readFile } from '@/infrastructures/file/FileReader'
import { parseCsv } from '@/infrastructures/csv/CsvParser'
import type { CsvFile } from '@/components/files/DragAndDropCsvFiles.type'

const props = withDefaults(defineProps<{ isSingle?: boolean }>(), {
  isSingle: false
})
const emits = defineEmits<{
  (e: 'load', csvFiles: CsvFile[]): void
}>()

const inputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const csvFiles = ref<CsvFile[]>([])

const onDragEnterLeft = () => (isDragging.value = true)
const onDragLeaveLeft = () => (isDragging.value = false)
const onClickDropArea = () => {
  console.log(inputRef)
  inputRef.value?.click()
}
const loadFiles = async (files: FileList | File[]) => {
  for (let file of files) {
    if (file.type !== 'text/csv') {
      continue
    }
    const fileData = await readFile(file)
    if (!fileData) {
      continue
    }
    const parsed = await parseCsv(fileData)
    csvFiles.value.push({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      ...parsed
    })
    if (props.isSingle) {
      break
    }
  }
  emits('load', csvFiles.value)
}
const onDrop = async (event: DragEvent) => {
  isDragging.value = false
  await loadFiles(event.dataTransfer?.files ?? [])
}

const onChangeFile = async (event: any) => {
  await loadFiles(event.target.files ?? [])
}
</script>

<template>
  <div class="drop-area-container">
    <div
      class="drop-area"
      :class="{ dragging: isDragging }"
      @dragenter.prevent="onDragEnterLeft"
      @dragover.prevent="onDragEnterLeft"
      @dragleave.prevent="onDragLeaveLeft"
      @drop.prevent="onDrop"
      @click.prevent="onClickDropArea"
    >
      ここにファイルをドロップしてください
    </div>
    <input
      ref="inputRef"
      type="file"
      class="file-input"
      :multiple="!props.isSingle"
      accept="text/csv,.csv,text/tsv,.tsv"
      @change="onChangeFile"
    />
  </div>
</template>

<style lang="scss" scoped>
.drop-area-container {
  width: 100%;
  height: 100px;
  cursor: pointer;

  .drop-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--10-percente-white);
    border: 2px dashed var(--25-percente-white);
    padding: 30px;

    &:hover {
      background-color: var(--25-percente-white);
    }

    &.dragging {
      background-color: var(--25-percente-white);
    }
  }

  .file-input {
    display: none;
  }
}
</style>
