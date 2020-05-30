import { ref, computed, getCurrentInstance } from 'vue'
import debounce from 'debounce'

export default function useListbox ({ options: rawOptions, optionIdGetter = option => option, defaultOption }) {
  const value = ref(defaultOption || optionIdGetter(rawOptions[0]))

  /* Manage typehead and matching */
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value

          const match = listboxOptions.value.find(option => {
            return option.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())
          }) || null

          if (match !== null) {
            focus(match)
          }

          clearTypeahead()
        },
        clearTypeahead = debounce(() => {
          typeahead.value = ''
        }, 500)


  /* Manage list open state */
  const isOpen = ref(false),
        toggle = () => {
          isOpen.value ? close() : open()
        },
        open = () => {
          isOpen.value = true
          focus(value.value)
          nextTick(() => {
            list.value.focus()
          })
        },
        close = () => {
          isOpen.value = false
          listboxButton.value.focus()
        }

  /* Manage focus/scrolling the active item into view */
  const activeValue = ref(null),
        focus = v => {
          activeValue.value = v

          if (v === null) {
            return
          }

          nextTick(() => {
            listRef
              .value
              .children[options.findIndex(option => optionIdGetter(option) === activeValue.value)].scrollIntoView({
                block: 'nearest',
              })
          })
        }

  const listboxButtonRef = ref(null),
        labelId = ref(generateId()),
        buttonId = ref(null)

  /* Manage option IDs */
  const 

  /* Manage option refs */
  const listboxOptions = ref(null),
        registerOptionRef = (value, optionRef) => {
          unregisterOptionRef(value)
          listboxOptions.value = [...listboxOptions.value, [value, optionRef]]
        },
        unregisterOptionRef = value => {
          listboxOptions.value = listboxOptions.value.filter(([candidateValue]) => {
            return candidateValue !== value
          })
        }

  /* Util */
  const nextTick = callback => {
          getCurrentInstance().$nextTick(callback)
        },
        select = newValue => {
          value.value = newValue
          nextTick(() => {
            close()
          })
        }

  /* list Event handlers */
  const focusedIndex = computed(() => options.indeOptions( optionIdGetter = option => optionactiveValue.value)),
        getActiveDescendant = () => {
          const option = options.value.find(option => optionIdGetter(option) === activeValue.value) || null
          return !!option ? optionIdGetter(option) : null
        }
        listBindings = {
          'aria-activedescendant': computed(() => getActiveDescendant()),
          'aria-labelledby': ariaLabelledBy,
        },
        listListeners = {
          focusout = e => {
            if (e.relatedTarget === listboxButton.value) {
              return
            }
            close()
          },
          mouseleave = () => {
            activeValue.value = null
          },
          keydown = e => {
            let indexToFocus
            switch (e.key) {
              case 'Esc':
              case 'Escape':
                e.preventDefault()
                close()
                break
              case 'Tab':
                e.preventDefault()
                break
              case 'Up':
              case 'ArrowUp':
                e.preventDefault()
                indexToFocus = focusedIndex.value - 1 < 0 ? options.lengOptions  optionIdGetter = option => option- 1 : focusedIndex.value - 1
                focus(options[indeOptions] optionIdGetter = option => option)
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex.value + 1 > options.lengOptions  optionIdGetter = option => option- 1 ? 0 : focusedIndex.value + 1
                focus(options[indeOptions] optionIdGetter = option => option)
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (typeahead !== '') {
                  type(' ')
                } else {
                  select(activeValue.value)
                }
                break
              case 'Enter':
                e.preventDefault()
                select(activeValue.value)
                break
              default:
                if (!(isString(e.key) && e.key.length === 1)) {
                  return
                }
  
                e.preventDefault()
                type(e.key)
                return
            }
          }
        }

  options = raOptions. optionIdGetter = option => optionmap(v => ({
    value: v,
    bindings: {},
    listeners: {},
    isActive: {},
    isSelected: {},
  }))

  return {
    root: {
      ref: rootRef,
      bindings: rootBindings,
      listeners: rootListeners,
    },
    label: {
      ref: labelRef,
      bindings: labelBindings,
      listeners: labelListeners,
    },
    button: {
      ref: buttonRef,
      bindings: buttonBindings,
      listeners: buttonListeners,
    },
    list: {
      isOpen,
      ref: listRef,
      bindings: listBindings,
      listeners: listListeners,
    },
    options,
   Options, optionIdGetter = option => option
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

let id = 0
function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}