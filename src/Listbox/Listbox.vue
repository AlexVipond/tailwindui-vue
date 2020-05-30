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
    const typeahead = ref(''),
          type = value => {
            typeahead.value = typeahead.value + value

            const [match] = optionRefs.value.find(([_value, ref]) => {
              return ref.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())
            }) || [null]

            if (match !== null) {
              focus(match)
            }

            clearTypeahead()
          },
          clearTypeahead = debounce(() => {
            typeahead.value = ''
          }, 500)


    /* Manage open state */
    const isOpen = ref(false),
          toggle = () => {
            isOpen.value ? close() : open()
          },
          open = () => {
            isOpen.value = true
            focus(props.value)
            nextTick(() => {
              listboxListRef.value().focus()
            })
          },
          close = () => {
            isOpen.value = false
            listboxButtonRef.value().focus()
          }

    /* Manage focus */
    const activeItem = ref(null),
          values = ref(null),
          listboxListRef = ref(null),
          focus = value => {
            activeItem.value = value

            if (value === null) {
              return
            }

            nextTick(() => {
              listboxListRef
                .value()
                .children[values.value.indexOf(activeItem.value)].scrollIntoView({
                  block: 'nearest',
                })
            })
          }


    const listboxButtonRef = ref(null),
          labelId = ref(null),
          buttonId = ref(null)

    /* Manage option IDs */
    const optionIds = ref(null),
          getActiveDescendant = () => {
            const [_value, id] = optionIds.value.find(([value]) => {
              return value === activeItem.value
            }) || [null, null]

            return id
          },
          registerOptionId = (value, optionId) => {
            unregisterOptionId(value)
            optionIds.value = [...optionIds.value, [value, optionId]]
          },
          unregisterOptionId = value => {
            optionIds.value = optionIds.value.filter(([candidateValue]) => {
              return candidateValue !== value
            })
          }

    /* Manage option refs */
    const optionRefs = ref(null),
          registerOptionRef = (value, optionRef) => {
            unregisterOptionRef(value)
            optionRefs.value = [...optionRefs.value, [value, optionRef]]
          },
          unregisterOptionRef = value => {
            optionRefs.value = optionRefs.value.filter(([candidateValue]) => {
              return candidateValue !== value
            })
          }

    /* Util */
    const nextTick = callback => {
            getCurrentInstance().$nextTick(callback)
          },
          select = value => {
            emit('input', value)
            nextTick(() => {
              close()
            })
          }

          
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
      labelId,
      buttonId,
      props,
    }))

    provide(ListboxSymbol, context)

    return {/* nada */}
  }
}
</script>