<script setup lang="ts">
import { fill } from 'lodash'
import { computed, ref } from 'vue'
import { v4 } from 'uuid'
import Papa from 'papaparse'
import { downloadCSV } from '@/infrastructures/file/FileDownloader'
import DragAndDropCsvFiles from '@/components/files/DragAndDropCsvFiles.vue'
import type { CsvFile as BaseCsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import FileCard from '@/components/files/FileCard.vue'
import { useI18n } from 'vue-i18n'

type CsvFile = {
  uuid: string
  targetHeaderIndexes: number[]
} & BaseCsvFile

const { t } = useI18n()

const csvFiles = ref<CsvFile[]>([])
const selectedUuids = ref<string[]>([])
const isHorizontalConcatMode = ref(false)
const horizontalKeyHeaderIndex = ref(0)

const onLoadCsvFiles = (baseCsvFiles: BaseCsvFile[]) => {
  csvFiles.value.push(
    ...baseCsvFiles.map((csvFile) => ({
      uuid: v4(),
      targetHeaderIndexes: [],
      ...csvFile
    }))
  )
}

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
const onClickFileCard = (csvFile: CsvFile) => {
  if (selectedUuids.value.includes(csvFile.uuid)) {
    selectedUuids.value = selectedUuids.value.filter((uuid) => uuid !== csvFile.uuid)
  } else {
    selectedUuids.value.push(csvFile.uuid)
  }
}
const removeCsvFile = (csvFile: CsvFile) => {
  csvFiles.value = csvFiles.value.filter((csv) => csv.uuid !== csvFile.uuid)
  selectedUuids.value = selectedUuids.value.filter((uuid) => uuid !== csvFile.uuid)
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
const hasKeyHeaderCell = (csvFile: CsvFile) => {
  const keyFile = selectedCsvFiles.value[0]
  if (!keyFile) {
    return false
  }
  const keyHeader = keyFile.header[horizontalKeyHeaderIndex.value]
  if (!keyHeader) {
    return false
  }
  return csvFile.header.includes(keyHeader)
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
    if (!hasKeyHeaderCell(csvFile)) {
      return
    }
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
const concatHorizontalSimple = () => {
  const newCsv: string[][] = []
  let lastFileColumnIndex = 0
  selectedCsvFiles.value.map((csvFile) => {
    let maxColumnSize = 0
    csvFile.rows.forEach((row, index) => {
      let newCsvRow = newCsv[index] ?? []
      if (maxColumnSize < row.length) {
        maxColumnSize = row.length
      }
      const prefix =
        newCsvRow.length < lastFileColumnIndex
          ? fill(Array(lastFileColumnIndex - newCsvRow.length), '')
          : []
      newCsvRow.push(...prefix, ...row)
      newCsv[index] = newCsvRow
    })
    lastFileColumnIndex += maxColumnSize
  })
  downloadCSV(Papa.unparse(newCsv), `${new Date().toISOString()}.csv`)
}
</script>

<template>
  <div class="concat-container">
    <drag-and-drop-csv-files class="drop-area-container" @load="onLoadCsvFiles" />
    <div v-if="csvFiles.length > 0" class="files-container">
      <p>
        {{ t('selectConcatFiles') }} (<a href="#" @click.prevent="clearSelectedUuids">{{
          t('deselect')
        }}</a
        >) (<a href="#" @click.prevent="clearCsvFiles">{{ t('clearFiles') }}</a
        >)
      </p>
      <div class="files">
        <file-card
          v-for="csvFile in csvFiles"
          :key="csvFile.uuid"
          :selected="selectedUuids.includes(csvFile.uuid)"
          :number="
            selectedUuids.includes(csvFile.uuid)
              ? selectedUuids.findIndex((uuid) => uuid === csvFile.uuid) + 1
              : undefined
          "
          :csv-file="csvFile"
          @click="onClickFileCard(csvFile)"
          @clear="removeCsvFile(csvFile)"
        />
      </div>
    </div>
    <div v-if="selectedUuids.length >= 2" class="concat-buttons-container">
      <p>{{ t('chooseType') }}</p>
      <div class="concat-buttons">
        <button class="button" @click.prevent="concatVertical">{{ t('concatVertical') }}</button>
        <button class="button" @click.prevent="concatHorizontalSimple">
          {{ t('concatHorizontal') }}
        </button>
        <button class="button" @click.prevent="isHorizontalConcatMode = true">
          {{ t('concatHorizontalByKey') }}
        </button>
      </div>
    </div>
    <div v-if="selectedUuids.length >= 2 && isHorizontalConcatMode" class="concat-files">
      <div class="concat-file-card">
        <p class="concat-file-name">1. {{ t('baseFile') }}: {{ selectedCsvFiles[0].fileName }}</p>
        <div class="header-cells">
          <div
            v-for="(headerCell, headerCellIndex) in selectedCsvFiles[0].header"
            :key="headerCellIndex"
            class="header-cell"
            :class="{ selected: horizontalKeyHeaderIndex === headerCellIndex }"
            @click.prevent="horizontalKeyHeaderIndex = headerCellIndex"
          >
            {{ headerCell }}
          </div>
        </div>
      </div>
      <p class="document-message">
        {{ t('chooseConcatColumn') }}
        {{
          t('chooseConcatColumnMessage', {
            columnName: selectedCsvFiles[0].header[horizontalKeyHeaderIndex]
          })
        }}
      </p>
      <div
        v-for="(csvFile, csvFileIndex) in selectedCsvFiles.slice(1, selectedCsvFiles.length)"
        :key="csvFile.uuid"
        class="concat-file-card"
      >
        <p class="concat-file-name">{{ csvFileIndex + 2 }}. {{ csvFile.fileName }}</p>
        <div v-if="!hasKeyHeaderCell(csvFile)">
          <span class="column-name">{{
            t('keyColumnNotFound', {
              columnName: selectedCsvFiles[0].header[horizontalKeyHeaderIndex]
            })
          }}</span>
        </div>
        <div v-if="hasKeyHeaderCell(csvFile)" class="header-cells">
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
      <button class="button" @click.prevent="concatHorizontal">{{ $t('actions.concat') }}</button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "selectConcatFiles": "結合するファイルを選択してください",
  "deselect": "選択を解除",
  "clearFiles": "ファイルをクリア",
  "chooseType": "結合の方法を選んでください",
  "concatVertical": "縦に結合する",
  "concatHorizontal": "単純に横に結合する",
  "concatHorizontalByKey": "キーを元に横に結合する",
  "baseFile": "ベースとなるファイル",
  "chooseConcatColumn": "結合する列を選んでください。",
  "chooseConcatColumnMessage": "「{columnName}」と同じ名前の列の値が一致する最初の行が結合されます。",
  "keyColumnNotFound": "「{columnName}」という名前の列がないため結合されません。"
}
</i18n>

<i18n lang="json" locale="en">
{
  "selectConcatFiles": "Please select the files to merge.",
  "deselect": "Deselect",
  "clearFiles": "Clear files",
  "chooseType": "Choose the merging method",
  "concatVertical": "Merge vertically",
  "concatHorizontal": "Simply merge horizontally",
  "concatHorizontalByKey": "Merge horizontally based on the key",
  "baseFile": "Base file",
  "chooseConcatColumn": "Please select the columns to merge.",
  "chooseConcatColumnMessage": "The first row with matching values in the column named \"{columnName}\" will be merged.",
  "keyColumnNotFound": "The column with the name \"{columnName}\" does not exist, so it will not be merged."
}
</i18n>

<style lang="scss" scoped>
a {
  color: var(--color-text);
}
.button {
  flex: 1;
}
.concat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 45px);

  .drop-area-container {
    padding: 30px;
  }

  .files-container {
    padding: 0 30px;
    margin-bottom: 30px;

    .files {
      display: flex;
      align-items: stretch;
      justify-content: flex-start;
      column-gap: 10px;
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
      background-color: var(--10-percente-white);
      border: 1px solid var(--25-percente-white);
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
          border: 1px solid var(--25-percente-white);
          padding: 5px 10px;
          cursor: pointer;
          &:hover {
            background-color: var(--25-percente-white);
          }
          &.selected {
            background-color: var(--25-percente-white);
          }
        }
      }
    }
  }

  .document-message {
    .column-name {
      border: 1px solid var(--25-percente-white);
      background-color: var(--10-percente-white);
    }
  }

  .concat-body {
    flex: 1;

    display: flex;

    .concat-body-left {
      flex: 1;
      &.dragging {
        background-color: var(--25-percente-white);
      }
    }
    .concat-body-right {
      flex: 1;
    }
  }
}
</style>
