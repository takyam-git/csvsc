<script setup lang="ts">
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import SelectBox from '@/components/forms/SelectBox.vue'
import { Locale } from '@/stores/locale'
import type { NewColumn } from '@/domains/csv/ColumnAdd'
import { downloadCsvByRows } from '@/infrastructures/file/FileDownloader'
import { addColumns } from '@/domains/csv/ColumnAdd'

const { t, locale } = useI18n()

const props = defineProps<{ csv: CsvFile }>()

const defaultNewColumn = { preIndex: props.csv.header.length - 1, name: '' }
const newColumns = ref<NewColumn[]>([{ ...defaultNewColumn }])

const columnSelectOptions = computed(() => [
  { label: `[${t('addToTheBeginning')}]`, value: '-1' },
  ...props.csv.header.map((label, index) => ({ label, value: `${index}` }))
])

const onChangeColumnHeader = (index: number, value: string) => {
  newColumns.value.splice(index, 1, { ...newColumns.value[index], preIndex: Number(value) })
}
const onChangeColumnName = (index: number, event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return
  }
  newColumns.value.splice(index, 1, { ...newColumns.value[index], name: event.target.value })
}
const addNewColumn = () => newColumns.value.push({ ...defaultNewColumn })
const removeNewColumn = (index: number) => newColumns.value.splice(index, 1)
const submitSort = async () => {
  await downloadCsvByRows(addColumns(props.csv, newColumns.value).rows)
}
</script>

<template>
  <div class="add-column-action-container">
    <div class="add-columns">
      <div v-for="(column, index) in newColumns" :key="index" class="add-column">
        <template v-if="locale === Locale.En">
          <p>Add the column</p>
          <div>
            <input type="text" :value="column.name" @input="onChangeColumnName(index, $event)" />
          </div>
          <p>after the column</p>
          <select-box
            :options="columnSelectOptions"
            :value="`${column.preIndex}`"
            @change="onChangeColumnHeader(index, $event)"
          />
          <a href="#" @click.prevent="removeNewColumn(index)">(Remove)</a>
        </template>
        <template v-if="locale !== Locale.En">
          <select-box
            :options="columnSelectOptions"
            :value="`${column.preIndex}`"
            @change="onChangeColumnHeader(index, $event)"
          />
          <p>のあとに</p>
          <div>
            <input type="text" :value="column.name" @input="onChangeColumnName(index, $event)" />
          </div>
          <p>という名前の列を追加する</p>
          <a href="#" @click.prevent="removeNewColumn(index)">(削除する)</a>
        </template>
      </div>
    </div>

    <button class="button small add-condition-button" @click.prevent="addNewColumn">
      <i class="material-icons">add</i><span>{{ t('addColumn') }}</span>
    </button>

    <div v-if="newColumns.length > 0" class="submit-button-container">
      <button class="button" @click.prevent="submitSort">
        {{ t('submitAdd') }}
      </button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "addToTheBeginning": "先頭に追加する",
  "submitAdd": "列を追加する",
  "addColumn": "追加する列を追加する"
}
</i18n>
<i18n lang="json" locale="en">
{
  "addToTheBeginning": "Add to the beginning",
  "submitAdd": "Execute add columns",
  "addColumn": "Add columns to be add"
}
</i18n>

<style lang="scss" scoped>
.add-column-action-container {
  .add-columns {
    .add-column {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid var(--25-percente-white);
      border-radius: 4px;

      &:last-child {
        margin-bottom: 10px;
      }
    }
  }

  .add-condition-button {
    width: 250px;
    margin-bottom: 40px;
  }

  .submit-button-container {
    button {
      width: 100%;
    }
  }
}
</style>
