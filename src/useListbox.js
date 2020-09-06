import { ref, reactive, computed, nextTick } from 'vue'
import debounce from 'debounce'
import {
  useBindings, // Used for binding static and reactive data to DOM references
  useListeners // Used for adding event listeners, and cleaning them up when the component is unmounted
} from '@baleada/vue-features/util'

export default function useListbox ({ options: rawOptions, defaultOption }) {
  /* Set up DOM refs, including static attribute binding */
  const labelEl = ref(null),
        buttonEl = ref(null),
        listEl = ref(null),
        labelId = generateId()
  
  // labelId static bindings
  useBindings({ target: labelEl, bindings: { id: labelId } })
  useBindings({ target: buttonEl, bindings: { 'aria-labelledby': labelId } })
  useBindings({ target: listEl, bindings: { 'aria-labelledby': labelId } })

  useBindings({
    target: buttonEl,
    bindings: {
      type: 'button',
      'aria-haspopup': 'listbox',
    }
  })

  useBindings({
    target: listEl,
    bindings: { tabindex: '-1', role: 'listbox' }
  })

  useListeners({
    target: listEl,
    listeners: {
      keydown: e => {
        if (e.key === 'Tab') {
          e.preventDefault()
        }
      }
    }
  })

  /*
   * Set up array of options objects that we'll be
   * interacting with in the rest of the function.
   */
  const optionsEls = ref([]), // When attached to the element with v-for, this will become an array of DOM elements
        options = rawOptions.map((option, index) => {
          const value = option,
                isActive = computed(() => value === active.value),
                isSelected = computed(() => value === selected.value),
                el = computed(() => optionsEls.value[index]),
                id = generateId(),
                ariaSelected = computed(() => isSelected.value ? true : '')

          useBindings({
            target: el,
            bindings: { role: 'option', id, 'aria-selected': ariaSelected }
          })

          return { el, value, isActive, isSelected, id }
        })

  /* Manage selected option */
  const selected = ref(defaultOption || rawOptions[0]),
        select = newValue => {
          selected.value = newValue

          /* EFFECT: Close the list */
          nextTick(() => close())
        }
  
  options.forEach(({ el, value }) => {
    useListeners({
      target: el,
      listeners: { click: () => select(value) }
    })
  })

  useListeners({
    target: listEl,
    listeners: {
      keydown (e) {
        switch (e.key) {
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
        }
      }
    }
  })

  /* Manage active option */
  const active = ref(null),
        activeIndex = computed(() => options.findIndex(({ value }) => value === active.value)),
        activate = newValue => {
          active.value = newValue

          /* EFFECT: Scroll list to the active option */
          if (active.value === null) {
            return
          }
    
          nextTick(() => listEl.value.children[activeIndex.value].scrollIntoView({ block: 'nearest' }))
        },
        ariaActiveDescendant = computed(() => options.find(({ value }) => value === active.value)?.id || null)

  useBindings({
    target: listEl,
    bindings: { 'aria-activedescendant': ariaActiveDescendant }
  })

  options.forEach(({ el, value }) => {
    useListeners({
      target: el,
      listeners: {
        mouseenter () {
          if (active.value === value) {
            return
          }

          activate(value)
        }
      }
    })
  })
  
  useListeners({
    target: listEl,
    listeners: {
      mouseleave: ()  => (active.value = null),
      keydown: e => {
        let indexToFocus
        switch (e.key) {
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
        }
      }
    }
  })

  /* Manage typeahead */
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

  useListeners({
    target: listEl,
    listeners: {
      keydown: e => {
        if (!(isString(e.key) && e.key.length === 1)) {
          return
        }

        e.preventDefault()
        type(e.key)
      }
    }
  })

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

  useBindings({
    target: buttonEl,
    bindings: { 'aria-expanded': listIsOpen },
  })

  useListeners({
    target: buttonEl,
    listeners: { click: toggle }
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
      keydown (e) {
        switch (e.key) {
          case 'Esc':
          case 'Escape':
            e.preventDefault()
            close()
            break
        }
      }
    }
  })

  /* Manage button focus */
  const buttonIsFocused = ref(false)

  useListeners({
    target: buttonEl,
    listeners: {
      focus: () => (buttonIsFocused.value = true),
      blur: () => (buttonIsFocused.value = false),
    }
  })

  // The return value is plain object, so if you try to access its reactive refs
  // in a Vue template, you'll have to use [ref].value.
  //
  // For more ergonomic access, the user can call Vue's `reactive` method on this
  // object to unwrap all refs without losing reactivity.
  // 
  // `reactive` is used on the return value so that the user can destructure
  // without losing reactivity, and so that all `ref`s get unwrapped.
  //
  // https://v3.vuejs.org/guide/reactivity-fundamentals.html#access-in-reactive-objects
  // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
  return {
    label: {
      ref: el => (labelEl.value = el),
    },
    button: {
      ref: el => (buttonEl.value = el),
      isFocused: buttonIsFocused
    },
    list: {
      ref: el => (listEl.value = el),
      isOpen: listIsOpen
    },
    options: {
      values: options,
      // Since the options ref gets bound to a v-for, it's required to be a function ref
      // with a little extra logic inside.
      // 
      // https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for
      //
      // To keep the developer experience consistent, all other element refs are exposed
      // as functions, too. That way, developers consistently bind every element ref,
      // instead of passing strings to some elements and binding refs to others.
      ref: (el) => (optionsEls.value = [...optionsEls.value, el]),
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
