export default function defaultSlot(parent, scope) {
  return parent.$slots.default ? parent.$slots.default : parent.$scopedSlots.default(scope)
}