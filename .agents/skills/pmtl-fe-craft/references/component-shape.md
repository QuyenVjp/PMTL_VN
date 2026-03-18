# Component Shape

Use this reference when a component starts growing or feels “AI generated”.

## Good signs

- clear purpose
- small prop surface
- early returns
- domain naming instead of `data`, `item`, `value`
- one reason to re-render

## Refactor triggers

- multiple unrelated concerns in one component
- repeated conditional trees
- huge prop drilling
- business logic mixed into JSX formatting
- comments explaining obvious code
