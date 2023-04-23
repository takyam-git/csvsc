<script setup lang="ts">
import { v4 } from 'uuid'
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { FilterCondition } from '@/domains/csv/RowFilter'
import { CompareType, DataType, filterRows } from '@/domains/csv/RowFilter'
import RowFilterCondition from '@/components/RowFilterCondition.vue'
import { downloadCsvByRows } from '@/infrastructures/file/FileDownloader'

type Condition = FilterCondition & { uuid: string }

const { t } = useI18n()

const props = defineProps<{ csv: CsvFile }>()

const defaultCondition = {
  index: 0,
  dataType: DataType.Text,
  compareType: CompareType.Equal,
  compareValue: ''
}

const conditions = ref<Condition[]>([{ uuid: v4(), ...defaultCondition }])

const onChangeCondition = (condition: FilterCondition) => {
  const conditionIndex = conditions.value.findIndex((c) => c.uuid === condition.uuid)
  if (conditionIndex >= 0) {
    conditions.value.splice(conditionIndex, 1, { ...condition })
  }
}
const addCondition = () => conditions.value.push({ uuid: v4(), ...defaultCondition })
const submitSort = async () => {
  await downloadCsvByRows(filterRows(props.csv, conditions.value).rows)
}
</script>

<template>
  <div class="row-filter-action-container">
    <div class="conditions">
      <row-filter-condition
        v-for="condition in conditions"
        :key="condition.uuid"
        :model-value="condition"
        :header="props.csv.header"
        class="condition"
        @update:model-value="onChangeCondition"
      />
    </div>

    <button class="button small add-condition-button" @click.prevent="addCondition">
      <i class="material-icons">add</i><span>{{ t('addCondition') }}</span>
    </button>

    <div v-if="conditions.length > 0" class="submit-button-container">
      <button class="button" @click.prevent="submitSort">
        {{ t('submitFilter') }}
      </button>
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "submitFilter": "行フィルタする",
  "addCondition": "条件を追加する"
}
</i18n>
<i18n lang="json" locale="en">
{
  "submitFilter": "Run filter",
  "addCondition": "Add condition"
}
</i18n>

<style lang="scss" scoped>
.row-filter-action-container {
  .conditions {
    .condition {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 5px;
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
