<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { FilterCondition } from '@/domains/csv/RowFilter'
import { CompareType, DataType, isDataType } from '@/domains/csv/RowFilter'
import { computed } from 'vue'
import SelectBox from '@/components/forms/SelectBox.vue'
import type { CsvRow } from '@/infrastructures/csv/CsvParser'

const { t } = useI18n()
const props = defineProps<{
  modelValue: FilterCondition
  header: CsvRow
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', condition: FilterCondition): void
}>()

const columnOptions = computed(() =>
  props.header.map((name, index) => ({ label: name, value: `${index}` }))
)
const dataTypeOptions = computed(() => [
  { value: DataType.Numeric, label: t(`dataTypes.${DataType.Numeric}`) },
  { value: DataType.Text, label: t(`dataTypes.${DataType.Text}`) },
  { value: DataType.Date, label: t(`dataTypes.${DataType.Date}`) },
  { value: DataType.Time, label: t(`dataTypes.${DataType.Time}`) },
  { value: DataType.DateTime, label: t(`dataTypes.${DataType.DateTime}`) }
])
const compareTypeOptions = computed(() => {
  const options = {
    [CompareType.Equal]: {
      value: CompareType.Equal,
      label: t(`compareTypes.${CompareType.Equal}`)
    },
    [CompareType.NotEqual]: {
      value: CompareType.NotEqual,
      label: t(`compareTypes.${CompareType.NotEqual}`)
    },
    [CompareType.GreaterThan]: {
      value: CompareType.GreaterThan,
      label: t(`compareTypes.${CompareType.GreaterThan}`)
    },
    [CompareType.GreaterThanOrEqual]: {
      value: CompareType.GreaterThanOrEqual,
      label: t(`compareTypes.${CompareType.GreaterThanOrEqual}`)
    },
    [CompareType.LessThan]: {
      value: CompareType.LessThan,
      label: t(`compareTypes.${CompareType.LessThan}`)
    },
    [CompareType.LessThanOrEqual]: {
      value: CompareType.LessThanOrEqual,
      label: t(`compareTypes.${CompareType.LessThanOrEqual}`)
    }
  }
  const allOptions = Object.values(options)
  const equalAndNotEqualOptions = [options[CompareType.Equal], options[CompareType.NotEqual]]
  return {
    [DataType.Numeric]: [...allOptions],
    [DataType.Text]: [...equalAndNotEqualOptions],
    [DataType.Date]: [...allOptions],
    [DataType.Time]: [...allOptions],
    [DataType.DateTime]: [...allOptions]
  }
})

const onChangeCondition = (uuid: string, values: Partial<FilterCondition>) => {
  emits('update:modelValue', { ...props.modelValue, ...values })
}
const onChangeDataType = (uuid: string, value: string) => {
  if (!isDataType(value)) {
    return
  }
  const newCompareTypeOptions = compareTypeOptions.value[value]
  const newValue: Partial<FilterCondition> = { dataType: value }
  if (!newCompareTypeOptions.some((o) => o.value === props.modelValue.compareType)) {
    newValue.compareType = CompareType.Equal
  }
  onChangeCondition(uuid, newValue)
}
</script>

<template>
  <div class="row-filter-condition">
    <div class="condition-field">
      <label class="label" :for="`${modelValue.uuid}-index`">{{ t('columnTitle') }}:</label>
      <select-box
        :id="`${modelValue.uuid}-index`"
        :value="`${modelValue.index}`"
        :options="columnOptions"
        @change="onChangeCondition(modelValue.uuid, { index: Number($event) })"
      />
    </div>
    <div class="condition-field">
      <label class="label" :for="`${modelValue.uuid}-data-type`">{{ t('dataType') }}:</label>
      <select-box
        :id="`${modelValue.uuid}-data-type`"
        :value="`${modelValue.dataType}`"
        :options="dataTypeOptions"
        @change="onChangeDataType(modelValue.uuid, $event)"
      />
    </div>
    <div class="condition-field">
      <label class="label" :for="`${modelValue.uuid}-compare-type`">{{ t('compareType') }}:</label>
      <select-box
        :id="`${modelValue.uuid}-compare-type`"
        :value="`${modelValue.compareType}`"
        :options="compareTypeOptions[modelValue.dataType]"
        @change="onChangeCondition(modelValue.uuid, { compareType: $event })"
      />
    </div>
    <div class="condition-field">
      <label class="label" :for="`${modelValue.uuid}-compare-value`"
        >{{ t('compareValue') }}:</label
      >
      <input
        :id="`${modelValue.uuid}-compare-value`"
        :type="
          modelValue.dataType === DataType.DateTime
            ? 'datetime-local'
            : modelValue.dataType === DataType.Date
            ? 'date'
            : modelValue.dataType === DataType.Time
            ? 'time'
            : 'text'
        "
        @input="onChangeCondition(modelValue.uuid, { compareValue: $event.target.value })"
      />
    </div>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "columnTitle": "ヘッダーの名前",
  "dataType": "値の種類",
  "dataTypes": {
    "numeric": "数値",
    "text": "文字",
    "date": "日付",
    "time": "時刻",
    "date-time": "日時"
  },
  "compareType": "比較方法",
  "compareTypes": {
    "equal": "一致する",
    "not-equal": "一致しない",
    "greater-than": "より大きい",
    "grater-than-or-equal": "以上",
    "less-than": "より小さい",
    "less-than-or-equal": "未満"
  },
  "compareValue": "比較する値"
}
</i18n>
<i18n lang="json" locale="en">
{
  "columnTitle": "Column title",
  "dataType": "Data type",
  "dataTypes": {
    "numeric": "Numeric",
    "text": "Text",
    "date": "Date",
    "time": "Time",
    "date-time": "Date time"
  },
  "compareType": "Compare type",
  "compareTypes": {
    "equal": "Equal",
    "not-equal": "Not equal",
    "greater-than": "Greater than",
    "grater-than-or-equal": "Greater than or equal",
    "less-than": "Less than",
    "less-than-or-equal": "Less than or equal"
  },
  "compareValue": "Compare value"
}
</i18n>

<style lang="scss" scoped>
.row-filter-condition {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px;
  border: 1px solid var(--25-percente-white);

  .condition-field {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}
</style>
