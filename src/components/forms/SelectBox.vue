<script setup lang="ts">
export type OptionValue = string | null | undefined
export type Option = {
  label: string
  value: OptionValue
}

const props = withDefaults(defineProps<{ options: Option[]; value: OptionValue }>(), {
  value: null
})

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const onChangeLocale = (e: Event): void => {
  if (!(e.target instanceof HTMLSelectElement)) {
    return
  }

  emits('change', e.target.value)
}
</script>

<template>
  <select :value="props.value ?? ''" @change="onChangeLocale">
    <option
      v-for="(option, optionIndex) in props.options"
      :key="optionIndex"
      :value="option.value ?? ''"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<style lang="scss" scoped>
select {
  background-color: var(--vt-c-black-soft);
  color: var(--color-text);
  padding: 3px 5px;
  border: 1px solid var(--25-percente-white);
  border-radius: 4px;
  cursor: pointer;
}
</style>
