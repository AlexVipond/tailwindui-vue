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