# @tailwindui/vue

**This project is still in a pre-alpha state and could change dramatically at any time. Not for production.**

A set of completely unstyled, fully accessible UI components for Vue.js, designed to integrate beautifully with Tailwind CSS.

You bring the styles and the markup, we handle all of the complex keyboard interactions and ARIA management.

## Installation

```sh
# npm
npm install @tailwindui/vue

# Yarn
yarn add @tailwindui/vue
```

## Usage

### Listbox

Basic example:

```html
<template>
  <Listbox v-model="selectedWrestler" v-slot="{ isOpen }">
    <ListboxLabel class="sr-only">
      Select a wrestler:
    </ListboxLabel>
    <ListboxButton class="rounded p-3 border">
      {{ selectedWrestler }}
    </ListboxButton>
    <ListboxList v-show="isOpen">
      <ListboxOption
        v-for="wrestler in wrestlers"
        :key="wrestler"
        :value="wrestler"
        v-slot="{ isActive, isSelected }"
      >
        <div class="p-3" :class="isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'">
          {{ wrestler }}
          <img v-show="isSelected" src="/checkmark.svg">
        </div>
      </ListboxOption>
    </ListboxList>
  </Listbox>
</template>

<script>
  import { Listbox, ListboxLabel, ListboxButton, ListboxList, ListboxOption } from '@tailwindui/vue'

  export default {
    components: {
      Listbox,
      ListboxLabel,
      ListboxButton,
      ListboxList,
      ListboxOption,
    },
    data() {
      return {
        selectedWrestler: 'The Ultimate Warrior',
        wrestlers: [
          'The Ultimate Warrior',
          'Randy Savage',
          'Hulk Hogan',
          'Bret Hart',
          'The Undertaker',
          'Mr. Perfect',
          'Ted DiBiase',
          'Bam Bam Bigelow',
          'Yokozuna',
        ]
      }
    }
  }
</script>
```

### useListbox

Basic example:

```html
<template>
  <div
    ref="listboxRoot"
    v-bind="{ ...listbox.root.bindings }"
  >
    <span
      ref="listboxLabel"
      v-bind="{ ...listbox.label.bindings }"
    >
      Select a wrestler:
    </span>
    <button
      ref="listboxButton"
      class="rounded p-3 border"
      v-bind="{ ...listbox.button.bindings }"
    >
      {{ listbox.selectedOption }}
    </button>
    <ul
      ref="listboxList"
      v-show="listbox.list.isOpen"
      v-bind="{ ...listbox.list.bindings }"
    >
      <li
        v-for="({ value, bindings, isActive, isSelected }) in listbox.options.values"
        :key="value"
        v-bind="{ ...bindings }"
        ref="listboxOptions"
      >
        <div 
          class="p-3" 
          :class="isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'"
        >
          {{ value }}
          <img v-show="isSelected" src="/checkmark.svg">
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import { useListbox } from '@tailwindui/vue'

  export default {
    setup () {
      const listbox = useListbox({
              options: [
                'The Ultimate Warrior',
                'Randy Savage',
                'Hulk Hogan',
                'Bret Hart',
                'The Undertaker',
                'Mr. Perfect',
                'Ted DiBiase',
                'Bam Bam Bigelow',
                'Yokozuna',
              ],
              defaultOption: 'The Ultimate Warrior'
            })
    
      return {
        listbox,
        listboxRoot: listbox.root.ref,
        listboxLabel: listbox.label.ref,
        listboxList: listbox.list.ref,
        listboxOptions: listbox.options.ref,
        listboxButton: listbox.button.ref,
      }
    }      
  }
</script>
```


Benefits of composition function approach:
- Cedes full control of HTML semantics to the user
- Eliminates significant internal complexity
  - Doesn't use provide/inject, everything is in scope internally
  - Doesn't need to register option refs
- The composition function is fully renderless. This leaves the end user free to define their own SFC template, which [Vue can optimize more easily than a plain render function](https://www.fullstackradio.com/episodes/129?t=19m0s).
- User does not need to know how to use slots or scoped slots
- Internal code is collocated based on its purpose, rather than split across several different components