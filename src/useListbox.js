import { ref, computed, nextTick } from 'vue'
import debounce from 'debounce'
import {
  useBinding, // Used for binding static and reactive data to DOM references
  useListener // Used for adding event listeners, and cleaning them up when the component is unmounted
} from '@baleada/vue-features/util'

export default function useListbox ({ options: rawOptions, defaultOption }) {
  /* 
   * First, we build an array of options.
   * This array contains the core option objects that we'll be
   * interacting with in the rest of the function.
   */
  const optionsEls = ref(null), // When attached to the element with v-for, this becomes an array of DOM element references
        options = rawOptions.map((option, index) => {
          const value = option,
                isActive = computed(() => value === focusedValue.value),
                isSelected = computed(() => value === selectedValue.value),
                el = computed(() => optionsEls.value[index])
          
          // Statically bind the role
          useBinding({ target: el, attribute: 'role', value: 'option' })

          // Reactively bind the selected state
          useBinding({ target: el, attribute: 'aria-selected', value: isSelected })
          
          // Handle click
          useListener({
            target: el,
            eventType: 'click',
            callback () {
              select(value)
            }
          })

          // Handle mousemove
          useListener({
            target: el,
            eventType: 'mousemove',
            callback () {
              if (focusedValue.value === value) {
                return
              }

              focus(value)
            }
          })

          return {
            el,
            value,
            isActive,
            isSelected,
          }
        })

  /* Store the value of the selected option */
  const selectedValue = ref(defaultOption || rawOptions[0])
        select = newValue => {
          selectedValue.value = newValue

          /* EFFECT: Close the list */
          nextTick(() => close())
        }

  /* Store the value of the active/focused option */
  const focusedValue = ref(null),
        focus = newValue => {
          focusedValue.value = newValue

          /* EFFECT: Scroll list to the focused option */
          if (focusedValue.value === null) {
            return
          }
    
          nextTick(() => {
            const focusedOptionIndex = options.findIndex(({ value }) => value === focusedOption.value)
            list.el.value.children[focusedOptionIndex].scrollIntoView({ block: 'nearest' })
          })
        }

  /* Store typeahead */
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value
          clearTypeahead()

          /* EFFECT: Focus the first option that matches the typeahead */
          const match = options.find(({ ref: optionEl }) => {
            return optionEl.value.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())
          }) || { value: null }
    
          focus(getOptionValue(match))
        },
        clearTypeahead = debounce(() => {
          typeahead.value = ''
        }, 500)

  /* Manage list open state */
  const list = {
          el: ref(null),
          isOpen = ref(false),
        },
        toggle = () => {
          list.isOpen.value ? close() : open()
        },
        open = () => {
          list.isOpen.value = true
          focus(selectedValue.value)

          /* EFFECT: Focus the list of options */
          nextTick(() => {
            list.el.value.focus()
          })
        },
        close = () => {
          list.isOpen.value = false

          /* EFFECT: Focus the button */
          button.el.value.focus()
        }

  
  watch(
    () => selectedValue,
    () => 
  )




  
  /* Manage button focused state */
  const button = {
          el: ref(null),
          isFocused: ref(false),
        },
        buttonAttrs = [
          { attribute: type, value: 'button' }
          { attribute: 'aria-haspopup', value: 'listbox' }
          { attribute: 'aria-labelledby', value: '' }
          { attribute: 'aria-expanded', value: isOpen }
        ]
  
  useBinding({  })

        buttonBindings = {
          
        },
        buttonListeners = {
          onFocus: () => {
            isFocused.value = true
          },
          onBlur: () => {
            isFocused.value = false
          },
          click: toggle,
        }


  /* List */
  const focusedIndex = computed(() => options.findIndex(option => getOptionValue(option) === focusedValue.value)),
        getActiveDescendant = () => {
          const option = options.find(option => getOptionValue(option) === focusedValue.value) || null
          return !!option ? getOptionValue(option) : null
        },
        listBindings = {
          ref: list.el,
          tabindex: '-1',
          role: 'listbox',
          'aria-activedescendant': computed(() => getActiveDescendant()),
          'aria-labelledby': '',
        },
        listListeners = {
          onFocusout: e => {
            if (e.relatedTarget === button.value) {
              return
            }
            close()
          },
          onMouseleave: () => {
            focusedValue.value = null
          },
          onKeydown: e => {
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
                focus(getOptionValue(options[indexToFocus]))
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex.value + 1 > options.length - 1 ? 0 : focusedIndex.value + 1
                focus(getOptionValue(options[indexToFocus]))
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (typeahead.value !== '') {
                  type(' ')
                } else {
                  select(focusedValue.value)
                }
                break
              case 'Enter':
                e.preventDefault()
                select(focusedValue.value)
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


  const rootRef = ref(null),
        labelRef = ref(null)
  

  return {
    root: {
      ref: rootRef,
      bindings:  {
        ...rootBindings,
        ...rootListeners,
      },
    },
    label: {
      ref: labelRef,
      bindings:  {
        ...labelBindings,
        ...labelListeners,
      },
    },
    button: {
      isFocused,
      ref: buttonRef,
      bindings:  {
        ...buttonBindings,
        ...buttonListeners,
      },
    },
    list: {
      isOpen,
      ref: list.el,
      bindings:  {
        ...listBindings,
        ...listListeners,
      },
    },
    options: {
      ref: optionsEls,
      values: options,
    },
    selectedValue,
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

let id = 0
function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}
