<script setup lang="ts">
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { ref } from 'vue'
import { sequential } from '@/infrastructures/ArrayUtils'
import { useI18n } from 'vue-i18n'
import { downloadCsvByRows } from '@/infrastructures/file/FileDownloader'
import { filterColumns } from '@/domains/csv/ColumnFilter'

const { t } = useI18n()
const props = defineProps<{ csv: CsvFile }>()

const selectedIndexes = ref<number[]>(sequential(props.csv.header.length))
const toggleSelect = (index: number): void => {
  if (selectedIndexes.value.includes(index)) {
    selectedIndexes.value = selectedIndexes.value.filter((i) => i !== index)
  } else {
    selectedIndexes.value.push(index)
  }
}
const submitSort = async () => {
  await downloadCsvByRows(filterColumns(props.csv, selectedIndexes.value).rows)
}
</script>

<template>
  <div class="column-filter-action-container">
    <p class="message">{{ t('selectMessage') }}</p>
    <div class="headers">
      <div
        v-for="(header, headerIndex) in props.csv.header"
        :key="headerIndex"
        class="header"
        :class="{ selected: selectedIndexes.includes(headerIndex) }"
        @click.prevent="toggleSelect(headerIndex)"
      >
        {{ header }}
      </div>
    </div>
    <div v-if="selectedIndexes.length > 0" class="submit-button-container">
      <button class="button" @click.prevent="submitSort">
        {{ t('submitFilter') }}
      </button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "selectMessage": "不要な列の選択を外してください。選択済みの列だけに絞り込まれます。",
  "submitFilter": "列フィルタする"
}
</i18n>
<i18n lang="json" locale="en">
{
  "selectMessage": "Please deselect any unnecessary columns. Only the selected columns will be included.",
  "submitFilter": "Execute Filter"
}
</i18n>

<style lang="scss" scoped>
.column-filter-action-container {
  .message {
    margin-bottom: 20px;
  }

  .headers {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;

    .header {
      width: 150px;
      padding: 10px;
      border: 1px solid var(--25-percente-white);
      cursor: pointer;

      &:hover {
        background-color: var(--25-percente-white);
      }

      &.selected {
        background-color: var(--25-percente-white);
        &:hover {
          background-color: var(--10-percente-white);
        }
      }
    }
  }
  .submit-button-container {
    button {
      width: 100%;
    }
  }
}
</style>
