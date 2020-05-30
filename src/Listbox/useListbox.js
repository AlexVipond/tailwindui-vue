import { ref } from 'vue'

export default function useListbox ({ values, value }) {

  /* Listbox */
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value

          const match = optionRefs.value.find(([_value, ref]) => {
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
        setValues = newValues => (values.value = newValues),
        listboxListRef = ref(null),
        setListboxListRef = newListboxListRef => (listboxListRef.value = newListboxListRef),
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
        setLabelId = newLabelId => (labelId.value = newLabelId),
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

  return {
    root,
    label,
    button,
    list,
    values,
    value,
  }
}