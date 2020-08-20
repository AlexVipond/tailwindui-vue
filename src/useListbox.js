import { ref, computed, nextTick } from 'vue'
import { onMounted, watchEffect } from 'vue'
import debounce from 'debounce'
import {
  useBindings, // Used for binding static and reactive data to DOM references
  useListeners // Used for adding event listeners, and cleaning them up when the component is unmounted
} from '@baleada/vue-features/util'

export default function useListbox ({ options: rawOptions, defaultOption }) {
  /* 
   * First, we build an array of options.
   * This array contains the core option objects that we'll be
   * interacting with in the rest of the function.
   */
  const optionsEls = ref([]), // When attached to the element with v-for, this becomes an array of DOM element references
        options = rawOptions.map((option, index) => {
          const value = option,
                isActive = computed(() => value === active.value),
                isSelected = computed(() => value === selected.value),
                el = computed(() => optionsEls.value[index]),
                id = generateId()

          useBindings({
            target: el,
            bindings: {
              // Statically bind the role and id
              role: 'option',
              id,
              
              // Reactively bind the selected state
              'aria-selected': computed(() => isSelected.value ? true : '')
            },
          })
          
          // Handle click and mousemove
          useListeners({
            target: el,
            listeners: {
              click () {
                select(value)
              },
              mousemove () {
                if (active.value === value) {
                  return
                }
  
                activate(value)
              }
            }
          })

          return {
            el,
            value,
            isActive,
            isSelected,
            id,
          }
        })

  /* Store the value of the selected option */
  const selected = ref(defaultOption || rawOptions[0]),
        select = newValue => {
          selected.value = newValue

          /* EFFECT: Close the list */
          nextTick(() => close())
        }

  /* Manage option active status */
  const active = ref(null),
        activeIndex = computed(() => options.findIndex(({ value }) => value === active.value)),
        activate = newValue => {
          active.value = newValue

          /* EFFECT: Scroll list to the active option */
          if (active.value === null) {
            return
          }
    
          nextTick(() => listEl.value.children[activeIndex.value].scrollIntoView({ block: 'nearest' }))
        }

  /* Store typeahead */
  const typeahead = ref(''),
        type = value => {
          typeahead.value = typeahead.value + value
          clearTypeahead()

          /* EFFECT: Focus the first option that matches the typeahead */
          const match = options.find(({ el }) => {
            return el.value.innerText.toLowerCase().startsWith(typeahead.value.toLowerCase())
          }) || { value: null }
    
          activate(match.value)
        },
        clearTypeahead = debounce(() => {
          typeahead.value = ''
        }, 500)

  /* Manage list open state */
  const listIsOpen = ref(false),
        toggle = () => {
          listIsOpen.value ? close() : open()
        },
        open = () => {
          listIsOpen.value = true
          activate(selected.value)

          /* EFFECT: Focus the list of options */
          nextTick(() => {
            listEl.value.focus()
          })
        },
        close = () => {
          listIsOpen.value = false

          /* EFFECT: Focus the button */
          buttonEl.value.focus()
        }

  /* Set up label ref */
  const labelEl = ref(null),
        labelId = generateId()
  
  // Statically bind label ID
  useBindings({ target: labelEl, bindings: { id: labelId } })

  /* Set up button */
  const buttonEl = ref(null)
  
  useBindings({
    target: buttonEl,
    bindings: {
      // Statically bind some button attrs
      type: 'button',
      'aria-haspopup': 'listbox',
      'aria-labelledby': labelId,
      
      // Reactively bind list open state.
      'aria-expanded': listIsOpen,
    }
  })

  // Handle button focus, blur, and click
  const buttonIsFocused = ref(false)
  useListeners({
    target: buttonEl,
    listeners: {
      focus () {
        buttonIsFocused.value = true
      },
      blur () {
        buttonIsFocused.value = false
      },
      click: toggle,
    }
  })


  /* Set up list */
  const listEl = ref(null)

  useBindings({
    target: listEl,
    bindings: {
      tabindex: '-1',
      role: 'listbox',
      'aria-activedescendant': computed(() => options.find(({ value }) => value === active.value)?.id || null),
      'aria-labelledby': '',
    }
  })

  useListeners({
    target: listEl,
    listeners: {
      focusout (e) {
        if (e.relatedTarget === buttonEl.value) {
          return
        }

        close()
      },
      mouseleave () {
        active.value = null
      },
      keydown (e) {
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
            indexToFocus = activeIndex.value - 1 < 0 ? options.length - 1 : activeIndex.value - 1
            activate(options[indexToFocus].value)
            break
          case 'Down':
          case 'ArrowDown':
            e.preventDefault()
            indexToFocus = activeIndex.value + 1 > options.length - 1 ? 0 : activeIndex.value + 1
            activate(options[indexToFocus].value)
            break
          case 'Spacebar':
          case ' ':
            e.preventDefault()
            if (typeahead.value !== '') {
              type(' ')
            } else {
              select(active.value)
            }
            break
          case 'Enter':
            e.preventDefault()
            select(active.value)
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
  })

  return {
    label: {
      ref (el) {
        labelEl.value = el
      },
    },
    button: {
      ref (el) {
        buttonEl.value = el
      },
      isFocused: buttonIsFocused
    },
    list: {
      ref (el) {
        listEl.value = el
      },
      isOpen: listIsOpen
    },
    options: {
      values: options,
      ref (el) {
        optionsEls.value = [...optionsEls.value, el]
      },
    },
    selected,
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

let id = 0
// If there's ever a strong use case for customizing the id prefix,
// it could be exposed as an optional param for the composition function.
function generateId(idPrefix = 'tailwind-ui-listbox-id-') {
  return `${idPrefix}${++id}`
}
