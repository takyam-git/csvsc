<script setup lang="ts">
import { computed, ref } from 'vue'
import { v4 } from 'uuid'
import { readFile } from '@/infrastructures/file/FileReader'
import { parseCsv } from '@/infrastructures/csv/CsvParser'
import { fileSizeLabel } from '@/infrastructures/file/FileSize'
import Papa from 'papaparse'
import { downloadCSV } from '@/infrastructures/file/FileDownloader'

type CsvFile = {
  uuid: string
  fileName: string
  fileSize: number
  fileType: string
  header: string[]
  targetHeaderIndexes: number[]
  rows: string[][]
  rowSize: number
  columnSize: number
  isParsed: boolean
  error: string | null
}

const isDragging = ref(false)
const csvFiles = ref<CsvFile[]>([])
const selectedUuids = ref<string[]>([])
const isHorizontalConcatMode = ref(false)
const horizontalKeyHeaderIndex = ref(0)

const selectedCsvFiles = computed<CsvFile[]>(() => {
  const selectedCsvFiles: CsvFile[] = []
  selectedUuids.value.forEach((uuid) => {
    const csvFile = csvFiles.value.find((csvFile) => uuid === csvFile.uuid)
    if (csvFile) {
      selectedCsvFiles.push(csvFile)
    }
  })
  return selectedCsvFiles
})

const findCsvFileIndex = (uuid: string): number => {
  return csvFiles.value.findIndex((csvFile) => csvFile.uuid === uuid)
}
const updateCsvFile = (uuid: string, params: Partial<CsvFile>): void => {
  const index = findCsvFileIndex(uuid)
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
const onDragEnterLeft = () => (isDragging.value = true)
const onDragLeaveLeft = () => (isDragging.value = false)
const onDrop = (event: DragEvent) => {
  isDragging.value = false
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
      targetHeaderIndexes: [],
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
  isHorizontalConcatMode.value = false
}
const clearSelectedUuids = () => {
  selectedUuids.value = []
  isHorizontalConcatMode.value = false
}
const concatVertical = () => {
  if (selectedCsvFiles.value.length < 2) {
    return
  }
  let newCsvRows: string[][] = []
  selectedCsvFiles.value.forEach((csvFile, index) => {
    newCsvRows = newCsvRows.concat(csvFile.rows.slice(index === 0 ? 0 : 1, csvFile.rows.length))
  })
  const newCsv = Papa.unparse(newCsvRows)
  downloadCSV(newCsv, `${new Date().toISOString()}.csv`)
}
const toggleTargetHeaderCell = (uuid: string, headerIndex: number) => {
  const index = findCsvFileIndex(uuid)
  if (index < 0) {
    return
  }
  const csvFile = csvFiles.value[index]
  if (!csvFile) {
    return
  }
  const targetHeaderIndexes = csvFile.targetHeaderIndexes.includes(headerIndex)
    ? csvFile.targetHeaderIndexes.filter((index) => index !== headerIndex)
    : [...csvFile.targetHeaderIndexes, headerIndex]
  csvFiles.value.splice(index, 1, { ...csvFile, targetHeaderIndexes })
}
const concatHorizontal = () => {
  if (selectedCsvFiles.value.length < 2) {
    return
  }
  const baseFile = selectedCsvFiles.value[0]
  const tailFiles = selectedCsvFiles.value.slice(1, selectedCsvFiles.value.length)
  if (!baseFile || tailFiles.length === 0) {
    return
  }

  const keyField = `${baseFile.header[horizontalKeyHeaderIndex.value] ?? ''}`.trim()
  if (!keyField) {
    return
  }

  let newCsv = [...baseFile.rows]
  tailFiles.forEach((csvFile) => {
    if (csvFile.targetHeaderIndexes.length === 0) {
      return
    }
    const keyIndex = csvFile.header.findIndex((header) => header.trim() === keyField)
    if (keyIndex < 0) {
      return
    }
    const pickedRows: Record<string, string[]> = {}
    csvFile.rows.forEach((row) => {
      const keyValue = row[keyIndex]
      if (
        keyValue !== '' &&
        typeof keyValue !== 'undefined' &&
        typeof pickedRows[keyValue] === 'undefined'
      ) {
        pickedRows[keyValue] = row.filter((cell, index) =>
          csvFile.targetHeaderIndexes.includes(index)
        )
      }
    })
    const emptyAddRow = csvFile.targetHeaderIndexes.map(() => '')
    newCsv = newCsv.map((row, baseRowIndex) => {
      if (baseRowIndex === 0) {
        return [...row, ...csvFile.targetHeaderIndexes.map((i) => csvFile.header[i])]
      }
      const baseValue = row[horizontalKeyHeaderIndex.value]
      console.log(baseValue)
      if (baseValue === '') {
        return [...row, ...emptyAddRow]
      }
      const addRow = pickedRows[baseValue]
      if (typeof addRow === 'undefined') {
        return [...row, ...emptyAddRow]
      }
      return [...row, ...addRow]
    })
  })
  downloadCSV(Papa.unparse(newCsv), `${new Date().toISOString()}.csv`)
}
</script>

<template>
  <div class="concat-container">
    <div class="drop-area-container">
      <div
        class="drop-area"
        :class="{ dragging: isDragging }"
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
        <button class="button" @click.prevent="concatVertical">縦に結合する</button>
        <button class="button" @click.prevent="isHorizontalConcatMode = true">横に結合する</button>
      </div>
    </div>
    <div v-if="selectedUuids.length >= 2 && isHorizontalConcatMode" class="concat-files">
      <div class="concat-file-card">
        <p class="concat-file-name">1. ベースとなるファイル: {{ csvFiles[0].fileName }}</p>
        <div class="header-cells">
          <div
            v-for="(headerCell, headerCellIndex) in csvFiles[0].header"
            :key="headerCellIndex"
            class="header-cell"
            :class="{ selected: horizontalKeyHeaderIndex === headerCellIndex }"
            @click.prevent="horizontalKeyHeaderIndex = headerCellIndex"
          >
            {{ headerCell }}
          </div>
        </div>
      </div>
      <div
        v-for="(csvFile, csvFileIndex) in selectedCsvFiles.slice(1, selectedCsvFiles.length)"
        :key="csvFile.uuid"
        class="concat-file-card"
      >
        <p class="concat-file-name">{{ csvFileIndex + 2 }}. {{ csvFile.fileName }}</p>
        <div class="header-cells">
          <div
            v-for="(header, headerIndex) in csvFile.header"
            :key="`${csvFile.uuid}-${headerIndex}`"
            class="header-cell"
            :class="{ selected: csvFile.targetHeaderIndexes.includes(headerIndex) }"
            @click.prevent="toggleTargetHeaderCell(csvFile.uuid, headerIndex)"
          >
            {{ header }}
          </div>
        </div>
      </div>
      <button class="button" @click.prevent="concatHorizontal">結合する</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
a {
  color: var(--color-text);
}
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
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }

  &[disabled] {
    cursor: default;
  }
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
    margin-bottom: 30px;

    .concat-buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      column-gap: 20px;
    }
  }

  .concat-files {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 0 30px;

    .concat-file-card {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 10px;

      .concat-file-name {
        font-size: 0.8rem;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .header-cells {
        display: flex;
        column-gap: 10px;

        .header-cell {
          width: 100px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 5px 10px;
          cursor: pointer;
          &:hover {
            background-color: rgba(255, 255, 255, 0.25);
          }
          &.selected {
            background-color: rgba(255, 255, 255, 0.25);
          }
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
