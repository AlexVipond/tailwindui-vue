<template lang="html">
  <ul
    ref="listboxList"
    tabindex="-1"
    role="listbox"
    :aria-activedescendant="context.getActiveDescendant()"
    :aria-labelledby="context.props.labelledby"
    @focusout="handleFocusout"
    @mouseleave="handleMouseleave"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </ul>
</template>

<script>
import { ref, computed, inject, getCurrentInstance } from 'vue'
import ListboxSymbol from './ListboxSymbol'

export default {
  setup () {
    const context = inject(ListboxSymbol),
          listboxList = ref(null)

    context.value.setListboxListRef = computed(() => listboxList.value)

    const children = defaultSlot(getCurrentInstance(), {})
    const values = children.map((node) => node.componentOptions.propsData.value)
    context.value.values = values
    const focusedIndex = values.indexOf(this.context.value.activeItem)

    /* Event handlers */
    const handleFocusout = e => {
            if (e.relatedTarget === context.value.listboxButtonRef()) {
              return
            }
            context.value.close()
          },
          handleMouseleave = () => {
            context.value.activeItem = null
          },
          handleKeydown = e => {
            let indexToFocus
            switch (e.key) {
              case 'Esc':
              case 'Escape':
                e.preventDefault()
                context.value.close()
                break
              case 'Tab':
                e.preventDefault()
                break
              case 'Up':
              case 'ArrowUp':
                e.preventDefault()
                indexToFocus = focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1
                context.value.focus(values[indexToFocus])
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex + 1 > values.length - 1 ? 0 : focusedIndex + 1
                context.value.focus(values[indexToFocus])
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (context.value.typeahead !== '') {
                  context.value.type(' ')
                } else {
                  context.value.select(context.value.activeItem)
                }
                break
              case 'Enter':
                e.preventDefault()
                context.value.select(context.value.activeItem)
                break
              default:
                if (!(isString(e.key) && e.key.length === 1)) {
                  return
                }

                e.preventDefault()
                context.value.type(e.key)
                return
            }
          }

    return {
      context,
      handleFocusout,
      handleMouseleave,
      handleKeydown,
    }
  }
}
</script>

