<script setup lang="ts">
import { computed, ref } from 'vue'
import DragAndDropCsvFiles from '@/components/files/DragAndDropCsvFiles.vue'
import type { CsvFile as BaseCsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import FileCard from '@/components/files/FileCard.vue'
import { useI18n } from 'vue-i18n'
import { ActionType } from '@/types/views/EditView'
import RowFilterAction from '@/components/views/edit/RowFilterAction.vue'
import ColumnFilterAction from '@/components/views/edit/ColumnFilterAction.vue'
import SortRowsAction from '@/components/views/edit/SortRowsAction.vue'
import SortColumnsAction from '@/components/views/edit/SortColumnsAction.vue'
import ReplaceValuesAction from '@/components/views/edit/ReplaceValuesAction.vue'
import AddColumnsAction from '@/components/views/edit/AddColumnsAction.vue'

type CsvFile = {} & BaseCsvFile

const { t } = useI18n()

const csvFile = ref<CsvFile | null>(null)
const currentActionType = ref<ActionType | null>(null)

const onLoadCsvFiles = (baseCsvFiles: BaseCsvFile[]) => {
  csvFile.value = baseCsvFiles[0] ?? null
}
const selectAction = (newActionType: ActionType) => (currentActionType.value = newActionType)
const actionTypes = computed(() => Object.values(ActionType))
</script>

<template>
  <div class="editor-container">
    <div class="file-container">
      <drag-and-drop-csv-files v-if="!csvFile" is-single @load="onLoadCsvFiles" />
      <file-card v-if="csvFile" :csv-file="csvFile" @clear="csvFile = null" />
    </div>
    <div v-if="csvFile" class="action-buttons-container">
      <button
        v-for="actionType in actionTypes"
        :key="actionType"
        class="button"
        :class="{ selected: currentActionType === actionType }"
        @click.prevent="selectAction(actionType)"
      >
        {{ t(actionType) }}
      </button>
    </div>
    <div v-if="csvFile" class="actions-container">
      <row-filter-action v-if="currentActionType === ActionType.RowFilter" />
      <column-filter-action v-if="currentActionType === ActionType.ColumnFilter" />
      <sort-rows-action v-if="currentActionType === ActionType.SortRows" :csv="csvFile" />
      <sort-columns-action v-if="currentActionType === ActionType.SortColumns" />
      <replace-values-action v-if="currentActionType === ActionType.ReplaceValues" />
      <add-columns-action v-if="currentActionType === ActionType.AddColumns" />
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "rowFilter": "行フィルタ",
  "columnFilter": "列フィルタ",
  "sortRows": "行並び替え",
  "sortColumns": "列並び替え",
  "replaceValues": "値を置換",
  "addColumns": "列追加"
}
</i18n>
<i18n lang="json" locale="en">
{
  "rowFilter": "Filter rows",
  "columnFilter": "Filter columns",
  "sortRows": "Sort rows",
  "sortColumns": "Sort columns",
  "replaceValues": "Replace values",
  "addColumns": "Add columns"
}
</i18n>

<style lang="scss" scoped>
.editor-container {
  padding: 0 30px;

  .file-container {
    margin-bottom: 20px;
  }

  .action-buttons-container {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;

    button.button {
      width: 150px;
    }
  }
}
</style>
