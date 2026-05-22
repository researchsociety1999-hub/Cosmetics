# Mystique — Accessibility Checklist

Generated for Sprint 1. Review each item against the live app.

## Keyboard Navigation

- [ ] Tab order follows visual reading order on every page
- [ ] All interactive elements (links, buttons, inputs, selects) are reachable via Tab
- [ ] Focus ring is visible on every focused element (`outline` not removed globally)
- [ ] Modal/dialog traps focus correctly and returns it on close
- [ ] Dropdown menus (Navbar) close on Escape
- [ ] Cart slide-out / drawer closes on Escape
- [ ] No keyboard traps (user can always exit any component)

## Screen Reader

- [ ] Skip-to-content link is the first focusable element (`<SkipToContent />` component)
- [ ] Page `<title>` is unique and descriptive on every route
- [ ] `<main id="main-content">` present on every page
- [ ] `<nav aria-label="Main navigation">` on Navbar
- [ ] `aria-current="page"` on active nav link
- [ ] Modals/dialogs use `role="dialog"` and `aria-labelledby`
- [ ] Icon-only buttons have `aria-label` (e.g., cart icon, close button)
- [ ] Toast/alert messages use `role="status"` or `aria-live="polite"`
- [ ] Form errors use `aria-describedby` pointing to error message

## Images

- [ ] Every `<img>` has a non-empty `alt` attribute
- [ ] Decorative images use `alt=""`
- [ ] Product images: `alt` includes product name + variant (e.g., `alt="Mystique Serum — 30ml"`)
- [ ] `next/image` used for all product and hero images

## Forms

- [ ] Every `<input>` has a visible `<label>` (not just placeholder)
- [ ] Required fields marked with `aria-required="true"` or `required`
- [ ] Validation errors are announced to screen readers (`aria-live` or `aria-describedby`)
- [ ] Newsletter form: label + error state tested
- [ ] Checkout: address, email, card fields all have labels

## Color & Contrast

- [ ] Body text on background: ≥ 4.5:1 (WCAG AA)
- [ ] Large text / headings: ≥ 3:1
- [ ] Focus ring: visible against all backgrounds
- [ ] Primary button text on button background: verify teal contrast
- [ ] "Coming soon" badge text contrast verified

## Mobile / Touch

- [ ] All tap targets ≥ 44×44px (buttons, links, filter chips)
- [ ] Inputs don't trigger iOS zoom (font-size ≥ 16px on inputs)
- [ ] No hover-only interactions without tap equivalent

## Motion

- [ ] `prefers-reduced-motion` respected globally (base CSS handles this)
- [ ] Framer Motion animations respect `useReducedMotion()`
- [ ] No auto-playing videos without pause control

## Automated Testing

Run the Playwright accessibility smoke suite:

```bash
npx playwright test e2e/accessibility-smoke.spec.ts
```

For deeper audits, install `@axe-core/playwright` and add `checkA11y()` calls.
