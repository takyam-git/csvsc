<script setup lang="ts">
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectBox from '@/components/forms/SelectBox.vue'
import type { SortKey } from '@/domains/csv/Sort'
import { sortCsvRows, SortOrder, SortType } from '@/domains/csv/Sort'
import { downloadCsvByRows } from '@/infrastructures/file/FileDownloader'

type DisplayHeader = {
  headerIndex: number
  sortNumber: number
  ordinalSortNumber: string
  columnName: string
  isSelected: boolean
  sortKey: SortKey | undefined
}

const { t } = useI18n()
const { t: gt } = useI18n({ useScope: 'global' })

const isSortOrderValue = (sortOrder: string): sortOrder is SortOrder =>
  ['asc', 'desc'].includes(sortOrder)
const isSortTypeValue = (sortType: string): sortType is SortType =>
  ['string', 'number'].includes(sortType)

const props = defineProps<{ csv: CsvFile }>()
const sortKeys = ref<SortKey[]>([])

const headers = computed<DisplayHeader[]>(() =>
  props.csv.header
    .map((columnName, headerIndex): DisplayHeader => {
      const index = sortKeys.value.findIndex((sortKey) => sortKey.index === headerIndex)
      const sortKey = index >= 0 ? sortKeys.value[index] : undefined
      const sortNumber = sortKey ? index + 1 : 0
      return {
        headerIndex,
        columnName,
        isSelected: !!sortKey,
        sortNumber,
        ordinalSortNumber: sortNumber > 0 ? gt('ordinal', { number: sortNumber }) : '',
        sortKey
      }
    })
    .filter((header) => !!header)
)
const sortOrderOptions = computed(() => [
  { label: gt('sort.order.asc'), value: 'asc' },
  { label: gt('sort.order.desc'), value: 'desc' }
])
const sortTypeOptions = computed(() => [
  { label: gt('sort.type.string'), value: 'string' },
  { label: gt('sort.type.number'), value: 'number' }
])
const selectHeader = (headerIndex: number) => {
  const index = sortKeys.value.findIndex((sortKey) => sortKey.index === headerIndex)
  if (index < 0) {
    sortKeys.value.push({ index: headerIndex, order: SortOrder.Asc, type: SortType.String })
  } else {
    sortKeys.value.splice(index, 1)
  }
}
const onChangeSortOrder = (header: DisplayHeader, sortOrder: string) => {
  const index = sortKeys.value.findIndex((sortKey) => sortKey.index === header.headerIndex)
  if (index < 0) {
    return
  }
  const sortKey = sortKeys.value[index]
  if (!sortKey || !isSortOrderValue(sortOrder)) {
    return
  }
  sortKeys.value.splice(index, 1, { ...sortKey, order: sortOrder })
}
const onChangeSortType = (header: DisplayHeader, sortType: string) => {
  const index = sortKeys.value.findIndex((sortKey) => sortKey.index === header.headerIndex)
  if (index < 0) {
    return
  }
  const sortKey = sortKeys.value[index]
  if (!sortKey || !isSortTypeValue(sortType)) {
    return
  }
  sortKeys.value.splice(index, 1, { ...sortKey, type: sortType })
}
const submitSort = async () => {
  await downloadCsvByRows(sortCsvRows(props.csv, sortKeys.value).rows)
}
</script>

<template>
  <div class="row-filter-action-container">
    <div class="columns">
      <div
        v-for="header in headers"
        :key="header.headerIndex"
        class="column"
        @click.prevent="selectHeader(header.headerIndex)"
      >
        <p>{{ header.columnName }}</p>
        <div v-if="header.isSelected">
          <p v-if="header.sortNumber > 0">
            {{ t('sortNumber', { sortNumber: header.ordinalSortNumber }) }}
          </p>
          <div v-if="header.sortKey" class="sort-options">
            <p @click.stop>
              <label>
                <span>{{ t('sortOrder') }}</span>
                <select-box
                  :options="sortOrderOptions"
                  :value="header.sortKey.order ?? 'asc'"
                  @change="onChangeSortOrder(header, $event)"
                />
              </label>
            </p>
            <p @click.stop>
              <label @click.stop>
                <span>{{ t('sortType') }}</span>
                <select-box
                  :options="sortTypeOptions"
                  :value="header.sortKey.type ?? SortType.String"
                  @change="onChangeSortType(header, $event)"
                />
              </label>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="sortKeys.length > 0" class="submit-button-container">
      <button class="button" @click.prevent="submitSort">{{ t('submitSort') }}</button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "sortOrder": "並び順",
  "sortType": "方法",
  "sortNumber": "第{sortNumber}キー",
  "submitSort": "並び替える"
}
</i18n>
<i18n lang="json" locale="en">
{
  "sortOrder": "Order",
  "sortType": "Type",
  "sortNumber": "{sortNumber} key",
  "submitSort": "Execute sort"
}
</i18n>

<style lang="scss" scoped>
.row-filter-action-container {
  .columns {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
    border: 1px solid var(--25-percente-white);
    padding: 20px;
    gap: 10px;
    margin-bottom: 20px;

    .column {
      border: 1px solid var(--25-percente-white);
      padding: 10px 20px;
      width: 200px;
      cursor: pointer;

      &:hover {
        background-color: var(--10-percente-white);
      }

      &.selected {
        background-color: var(--10-percente-white);
      }

      .sort-options {
        p {
          margin-bottom: 5px;

          label {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: flex-start;
            gap: 10px;
          }
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
