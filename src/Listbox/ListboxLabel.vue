<template lang="html">
  <span :id="id">
    <slot></slot>
  </span>
</template>

<script>
import { ref, inject } from 'vue'
import ListboxSymbol from './ListboxSymbol'
import { generateId } from './util'

export default {
  setup () {
    const id = ref(generateId()),
          context = inject(ListboxSymbol)

    onMounted(() => {
      context.labelId.value = id.value
    })

    return {
      id
    }
  }
}
</script>

