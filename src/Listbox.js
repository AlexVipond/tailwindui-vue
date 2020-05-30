import debounce from 'debounce'

const ListboxSymbol = Symbol('Listbox')

let id = 0

function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}

function defaultSlot(parent, scope) {
  return parent.$slots.default ? parent.$slots.default : parent.$scopedSlots.default(scope)
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}


export const ListboxButton = {
  inject: {
    context: ListboxSymbol,
  },
  data: () => ({
    id: generateId(),
    isFocused: false,
  }),
  created() {
    this.context.listboxButtonRef.value = () => this.$el
    this.context.buttonId.value = this.id
  },
  render(h) {
    return h(
      'button',
      {
        attrs: {
          id: this.id,
          type: 'button',
          'aria-haspopup': 'listbox',
          'aria-labelledby': `${this.context.labelId.value} ${this.id}`,
          ...(this.context.isOpen.value ? { 'aria-expanded': 'true' } : {}),
        },
        on: {
          focus: () => {
            this.isFocused = true
          },
          blur: () => {
            this.isFocused = false
          },
          click: this.context.toggle,
        },
      },
      defaultSlot(this, { isFocused: this.isFocused })
    )
  },
}

export const ListboxList = {
  inject: {
    context: ListboxSymbol,
  },
  created() {
    this.context.listboxListRef.value = () => this.$refs.listboxList
  },
  render(h) {
    const children = defaultSlot(this, {})
    const values = children.map((node) => node.componentOptions.propsData.value)
    this.context.values.value = values
    const focusedIndex = values.indexOf(this.context.activeItem.value)

    return h(
      'ul',
      {
        ref: 'listboxList',
        attrs: {
          tabindex: '-1',
          role: 'listbox',
          'aria-activedescendant': this.context.getActiveDescendant(),
          'aria-labelledby': this.context.props.labelledby,
        },
        on: {
          focusout: (e) => {
            if (e.relatedTarget === this.context.listboxButtonRef.value()) {
              return
            }
            this.context.close()
          },
          mouseleave: () => {
            this.context.activeItem.value = null
          },
          keydown: (e) => {
            let indexToFocus
            switch (e.key) {
              case 'Esc':
              case 'Escape':
                e.preventDefault()
                this.context.close()
                break
              case 'Tab':
                e.preventDefault()
                break
              case 'Up':
              case 'ArrowUp':
                e.preventDefault()
                indexToFocus = focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1
                this.context.focus(values[indexToFocus])
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex + 1 > values.length - 1 ? 0 : focusedIndex + 1
                this.context.focus(values[indexToFocus])
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (this.context.typeahead.value !== '') {
                  this.context.type(' ')
                } else {
                  this.context.select(this.context.activeItem.value)
                }
                break
              case 'Enter':
                e.preventDefault()
                this.context.select(this.context.activeItem.value)
                break
              default:
                if (!(isString(e.key) && e.key.length === 1)) {
                  return
                }

                e.preventDefault()
                this.context.type(e.key)
                return
            }
          },
        },
      },
      children
    )
  },
}

export const ListboxOption = {
  inject: {
    context: ListboxSymbol,
  },
  data: () => ({
    id: generateId(),
  }),
  props: ['value'],
  watch: {
    value(newValue, oldValue) {
      this.context.unregisterOptionId(oldValue)
      this.context.unregisterOptionRef(this.value)
      this.context.registerOptionId(newValue, this.id)
      this.context.registerOptionRef(this.value, this.$el)
    },
  },
  created() {
    this.context.registerOptionId(this.value, this.id)
  },
  mounted() {
    this.context.registerOptionRef(this.value, this.$el)
  },
  beforeDestroy() {
    this.context.unregisterOptionId(this.value)
    this.context.unregisterOptionRef(this.value)
  },
  render(h) {
    const isActive = this.context.activeItem.value === this.value
    const isSelected = this.context.props.value === this.value

    return h(
      'li',
      {
        attrs: {
          id: this.id,
          role: 'option',
          ...(isSelected
            ? {
                'aria-selected': true,
              }
            : {}),
        },
        on: {
          click: () => {
            this.context.select(this.value)
          },
          mousemove: () => {
            if (this.context.activeItem.value === this.value) {
              return
            }

            this.context.activeItem.value = this.value
          },
        },
      },
      defaultSlot(this, {
        isActive,
        isSelected,
      })
    )
  },
}

