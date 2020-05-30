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