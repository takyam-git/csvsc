<script setup lang="ts">
import { fileSizeLabel } from '@/infrastructures/file/FileSize'
import type { CsvFile } from '@/types/components/files/DragAndDropCsvFiles/DragAndDropCsvFiles.type'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    selected?: boolean
    clearable?: boolean
    number?: number
    csvFile: CsvFile
  }>(),
  {
    selected: false,
    clearable: true
  }
)

const emits = defineEmits<{
  (e: 'click'): void
  (e: 'clear'): void
}>()

const { t, n } = useI18n()

const isNumberVisible = computed(() => props.number !== null && typeof props.number !== 'undefined')
</script>

<template>
  <div class="file-card" :class="{ selected: props.selected }" @click.prevent="emits('click')">
    <div v-if="isNumberVisible || props.clearable" class="header">
      <p v-if="isNumberVisible" class="selected-number">{{ props.number }}</p>
      <a v-if="props.clearable" href="#" class="clear-button" @click.prevent.stop="emits('clear')"
        >✗</a
      >
    </div>
    <p class="file-name">{{ props.csvFile.fileName }}</p>
    <p class="file-size">
      {{ fileSizeLabel(props.csvFile.fileSize) }} /
      {{ t('rows', { rows: n(props.csvFile.rowSize) }) }}
    </p>
  </div>
</template>

<i18n lang="json" locale="ja">
{
  "rows": "{rows}行"
}
</i18n>
<i18n lang="json" locale="en">
{
  "rows": "{rows} rows"
}
</i18n>

<style lang="scss" scoped>
.file-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 160px;
  border: 1px solid var(--25-percente-white);
  padding: 5px 10px 10px 10px;
  cursor: pointer;

  &.selected {
    background-color: var(--10-percente-white);
  }

  &:hover {
    background-color: var(--10-percente-white);
  }

  .header {
    display: flex;
    width: 100%;

    .selected-number {
      flex: 1;
    }

    .clear-button {
      flex: 1;
      text-align: right;
    }
  }

  .file-name {
    font-size: 0.8rem;
  }
  .file-size {
    font-size: 0.7rem;
  }
}
</style>
