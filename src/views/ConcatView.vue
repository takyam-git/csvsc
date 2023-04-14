<script setup lang="ts">
import { ref } from 'vue'
import { v4 } from 'uuid'
import type { CsvFile } from '@/domains/csv/CsvFile'
import { readFile } from '@/infrastructures/file/FileReader'
import { parseCsv } from '@/infrastructures/csv/CsvParser'
import { fileSizeLabel } from '@/infrastructures/file/FileSize'
import Papa from 'papaparse'
import { downloadCSV } from '@/infrastructures/file/FileDownloader'

const isLeftDragging = ref(false)
const csvFiles = ref<CsvFile[]>([])
const selectedUuids = ref<string[]>([])

const updateCsvFile = (uuid: string, params: Partial<CsvFile>): void => {
  const index = csvFiles.value.findIndex((csvFile) => csvFile.uuid === uuid)
  if (index < 0) {
    return
  }
  csvFiles.value.splice(index, 1, { ...csvFiles.value[index], ...params })
}
const loadAndParseCsv = async (uuid: string, file: File) => {
  const fileData = await readFile(file)
  if (!fileData) {
    updateCsvFile(uuid, { error: '読み込めませんでした' })
    return
  }
  const parsed = await parseCsv(fileData)
  updateCsvFile(uuid, { ...parsed, isParsed: true })
}
const onDragEnterLeft = () => (isLeftDragging.value = true)
const onDragLeaveLeft = () => (isLeftDragging.value = false)
const onDrop = (event: DragEvent) => {
  isLeftDragging.value = false
  for (let file of event.dataTransfer?.files ?? []) {
    if (file.type !== 'text/csv') {
      continue
    }
    const uuid = v4()
    csvFiles.value.push({
      uuid,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      header: [],
      rows: [],
      rowSize: 0,
      columnSize: 0,
      isParsed: false,
      error: null
    })
    loadAndParseCsv(uuid, file)
  }
}
const onClickFileCard = (csvFile: CsvFile) => {
  if (selectedUuids.value.includes(csvFile.uuid)) {
    selectedUuids.value = selectedUuids.value.filter((uuid) => uuid !== csvFile.uuid)
  } else {
    selectedUuids.value.push(csvFile.uuid)
  }
}
const clearCsvFiles = () => {
  clearSelectedUuids()
  csvFiles.value = []
}
const clearSelectedUuids = () => {
  selectedUuids.value = []
}
const concatVertical = () => {
  console.log('clicked')
  if (selectedUuids.value.length < 2) {
    console.log('a')
    return
  }
  let newCsvRows: string[][] = []
  selectedUuids.value.forEach((uuid) => {
    const csvFile = csvFiles.value.find((csvFile) => uuid === csvFile.uuid)
    console.log({ csvFile })
    if (!csvFile) {
      return
    }
    newCsvRows = newCsvRows.concat(csvFile.rows.slice(1, csvFile.rows.length))
  })
  const newCsv = Papa.unparse(newCsvRows)
  downloadCSV(newCsv, `${new Date().toISOString()}.csv`)
}
</script>

<template>
  <div class="concat-container">
    <div class="drop-area-container">
      <div
        class="drop-area"
        :class="{ dragging: isLeftDragging }"
        @dragenter.prevent="onDragEnterLeft"
        @dragover.prevent="onDragEnterLeft"
        @dragleave.prevent="onDragLeaveLeft"
        @drop.prevent="onDrop"
      >
        ここにファイルをドロップしてください
      </div>
    </div>
    <div v-if="csvFiles.length > 0" class="files-container">
      <p>
        結合するファイルを選択してください (<a href="#" @click.prevent="clearSelectedUuids"
          >選択をクリア</a
        >) (<a href="#" @click.prevent="clearCsvFiles">ファイルをクリア</a>)
      </p>
      <div class="files">
        <div
          v-for="csvFile in csvFiles"
          :key="csvFile.uuid"
          class="file-card"
          :class="{ selected: selectedUuids.includes(csvFile.uuid) }"
          @click.prevent="onClickFileCard(csvFile)"
        >
          <p v-if="selectedUuids.includes(csvFile.uuid)" class="selected-number">
            {{ selectedUuids.findIndex((uuid) => uuid === csvFile.uuid) + 1 }}
          </p>
          <p class="file-name">{{ csvFile.fileName }}</p>
          <p class="file-size">{{ fileSizeLabel(csvFile.fileSize) }} / {{ csvFile.rowSize }}行</p>
        </div>
      </div>
    </div>
    <div v-if="selectedUuids.length >= 2" class="concat-buttons-container">
      <p>結合の方法を選んでください</p>
      <div class="concat-buttons">
        <a href="#" class="button" @click.prevent="concatVertical">縦に結合する</a>
        <a href="#" class="button" @click.prevent>横に結合する</a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
a {
  color: var(--color-text);
}
.concat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 45px);

  .drop-area-container {
    width: 100%;
    height: 15%;
    padding: 30px;
    .drop-area {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      border: 2px dashed rgba(255, 255, 255, 0.25);

      &.dragging {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .files-container {
    padding: 0 30px;
    margin-bottom: 30px;

    .files {
      display: flex;
      align-items: stretch;
      justify-content: flex-start;
      column-gap: 10px;

      .file-card {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 160px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        padding: 25px 10px 10px 10px;
        cursor: pointer;

        &.selected {
          background-color: rgba(255, 255, 255, 0.1);
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .selected-number {
          position: absolute;
          top: 2px;
          left: 5px;
          z-index: 100;

        }

        .file-name {
          font-size: 0.8rem;
        }
        .file-size {
          font-size: 0.7rem;
        }
      }
    }
  }

  .concat-buttons-container {
    padding: 0 30px;

    .concat-buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      column-gap: 20px;

      .button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0;
        text-decoration: none;
        flex: 1;
        color: var(--color-text);
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 4px;

        &:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
      }
    }
  }

  .concat-body {
    flex: 1;

    display: flex;

    .concat-body-left {
      flex: 1;
      &.dragging {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
    .concat-body-right {
      flex: 1;
    }
  }
}
</style>
