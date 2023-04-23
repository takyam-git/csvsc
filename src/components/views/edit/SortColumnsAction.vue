<script setup lang="ts">
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { ref } from 'vue'
import { moveElement, sequential } from '@/infrastructures/ArrayUtils'
import { useI18n } from 'vue-i18n'
import { downloadCsvByRows } from '@/infrastructures/file/FileDownloader'
import { sortColumns } from '@/domains/csv/ColumnSort'

const { t } = useI18n()
const props = defineProps<{ csv: CsvFile }>()

const headerIndexes = ref<number[]>(sequential(props.csv.header.length))
const move = (index: number, distance: number): void => {
  const currentPosition = headerIndexes.value.findIndex((i) => i === index)
  if (currentPosition < 0) {
    return
  }
  headerIndexes.value = moveElement(headerIndexes.value, currentPosition, distance)
}

const submitSort = async () => {
  await downloadCsvByRows(sortColumns(props.csv, headerIndexes.value).rows)
}
</script>

<template>
  <div class="column-filter-action-container">
    <p class="message">{{ t('selectMessage') }}</p>
    <div class="headers">
      <div v-for="index in headerIndexes" :key="index" class="header">
        <span class="label">{{ props.csv.header[index] }}</span>
        <div class="buttons">
          <button class="button" @click.prevent="move(index, -1)">
            <i class="material-icons">navigate_before</i>
          </button>
          <button class="button" @click.prevent="move(index, 1)">
            <i class="material-icons">navigate_next</i>
          </button>
        </div>
      </div>
    </div>
    <div v-if="headerIndexes.length > 0" class="submit-button-container">
      <button class="button" @click.prevent="submitSort">
        {{ t('submitFilter') }}
      </button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "selectMessage": "列を並び替えたい順番に入れ替えてください。",
  "submitFilter": "列を並び替える"
}
</i18n>
<i18n lang="json" locale="en">
{
  "selectMessage": "Please rearrange the columns in the order you'd like them to appear.",
  "submitFilter": "Execute column sort"
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
      display: flex;
      flex-direction: column;
      width: 150px;
      padding: 10px;
      border: 1px solid var(--25-percente-white);

      .label {
        margin-bottom: 5px;
      }

      .buttons {
        display: flex;
        align-items: stretch;
        gap: 10px;

        .button {
          flex: 1;
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
