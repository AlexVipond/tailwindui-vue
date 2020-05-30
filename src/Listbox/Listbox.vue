<template lang="html">
  <div>
    <slot v-bind="{ isOpen }"></slot>
  </div>
</template>

<script>
import { ref, provide, getCurrentInstance } from 'vue'
import debounce from 'debounce'
import ListboxSymbol from './ListboxSymbol'

export default {
  props: {
    value: {
      type: String,
    },
  },
  setup (props, { emit }) {
    /* Manage typeahead */
    const 

          
    /* Create and provide context */
    const context = computed(() => ({
      getActiveDescendant,
      registerOptionId,
      unregisterOptionId,
      registerOptionRef,
      unregisterOptionRef,
      toggle,
      open,
      close,
      select,
      focus,
      clearTypeahead,
      typeahead,
      type,
      listboxButtonRef,
      listboxListRef,
      isOpen,
      activeItem,
      values,
      setValues,
      labelId,
      setLabelId,
      buttonId,
      props,
    }))

    provide(ListboxSymbol, context)

    return {/* nada */}
  }
}
</script>