import { ref, computed, getCurrentInstance } from 'vue'
import debounce from 'debounce'

export default function useListbox ({ options: rawOptions, getOptionId = option => option, defaultOption }) {
  const selectedOption = ref((defaultOption && getOptionId(defaultOption)) || getOptionId(rawOptions[0]))

  const rootRef = ref(null),
        rootBindings = {},
        rootListeners = {},
        labelRef = ref(null),
        labelBindings = {},
        labelListeners = {}

  /* Manage typeahead and focusing the first matching option */
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value

          const match = options.find(({ ref: optionRef }) => {
            return optionRef.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())
          }) || null

          if (matchId !== null) {
            focus(getOptionId(match.value))
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
          focus(selectedOption.value)
          nextTick(() => {
            listRef.value.focus()
          })
        },
        close = () => {
          isOpen.value = false
          buttonRef.value.focus()
        }

  /* Manage the active option and focusing it */
  const activeOption = ref(null),
        listRef = ref(null),
        focus = id => {
          activeOption.value = id

          if (id === null) {
            return
          }

          console.log(listRef.value)

          nextTick(() => {
            listRef
              .value
              .children[options.findIndex(option => getOptionId(option) === activeOption.value)].scrollIntoView({
                block: 'nearest',
              })
          })
        }

  /* Manage button focused state */
  const buttonRef = ref(null),
        isFocused = ref(false),
        buttonBindings = {
          type: 'button',
          'aria-haspopup': 'listbox',
          'aria-labelledby': '', // TODO: expose as a prop? Should be a human-readable label, according to the spec: https://www.w3.org/TR/wai-aria/#aria-label
          'aria-expanded': computed(() => isOpen.value),
        },
        buttonListeners = {
          focus: () => {
            isFocused.value = true
          },
          blur: () => {
            isFocused.value = false
          },
          click: toggle,
        }

  /* Util */
  const nextTick = callback => {
          getCurrentInstance().$nextTick(callback)
        },
        select = newValue => {
          selectedOption.value = newValue
          nextTick(() => {
            close()
          })
        }

  /* List */
  const focusedIndex = computed(() => options.findIndex(option => getOptionId(option) === activeOption.value)),
        getActiveDescendant = () => {
          const option = options.find(option => getOptionId(option) === activeOption.value) || null
          return !!option ? getOptionId(option) : null
        },
        listBindings = {
          ref: listRef,
          tabindex: '-1',
          role: 'listbox',
          'aria-activedescendant': computed(() => getActiveDescendant()),
          'aria-labelledby': '', // TODO: expose as a prop? Should be a human-readable label, according to the spec: https://www.w3.org/TR/wai-aria/#aria-label
        },
        listListeners = {
          focusout: e => {
            if (e.relatedTarget === button.value) {
              return
            }
            close()
          },
          mouseleave: () => {
            activeOption.value = null
          },
          keydown: e => {
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
                indexToFocus = focusedIndex.value - 1 < 0 ? options.length - 1 : focusedIndex.value - 1
                focus(getOptionId(options[indexToFocus]))
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex.value + 1 > options.length - 1 ? 0 : focusedIndex.value + 1
                focus(getOptionId(options[indexToFocus]))
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (typeahead.value !== '') {
                  type(' ')
                } else {
                  select(activeOption.value)
                }
                break
              case 'Enter':
                e.preventDefault()
                select(activeOption.value)
                break
              default:
                if (!(isString(e.key) && e.key.length === 1)) {
                  return
                }

                e.preventDefault()
                this.context.type(e.key)
                return
            }
          }
        }
  
  /* Manage option refs */
  const optionsRef = ref(null),
        options = rawOptions.map((option, index) => {
          const id = getOptionId(option),
                isActive = computed(() =>  id === activeOption.value),
                isSelected = computed(() => id === selectedOption.value)

          return {
            ref: computed(() => optionsRef.value[index]),
            value: option,
            bindings: {
              role: 'option',
              'aria-selected': computed(() => isSelected.value),
            },
            listeners: {
              click: () => {
                select(id)
              },
              mousemove: () => {
                if (activeOption.value === id) {
                  return
                }
    
                activeOption.value = id
              },
            },
            isActive,
            isSelected,
          }
        })

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
      isFocused,
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
    options: {
      ref: optionsRef,
      values: options,
    },
    selectedOption,
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

let id = 0
function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}