# Geekly — Design Guide

Rules only. Follow this for every UI change.

## Brand and copy

- Motif: clear learning that builds confident engineers. Copy is simple, encouraging, and about fundamentals and practice.
- No fabricated testimonials, pricing, mentors, placements, counts or social proof.
- A headline and its description must agree. Do not invent quotations or testimonials.

## Theme

- Light is the default; dark is set on `[data-theme="dark"]` and persisted as `geekly-theme`.
- Use the tokens defined in `@theme` in `client/src/index.css` — blue-violet brand `#4057F5`, warm paper background `#F5F4EF`, white surface, ink panels `#14161C`, and a small terracotta accent (`accent`) for annotations. Soft periwinkle brand in dark mode. Never hardcode colours, shadows or radii.
- Ink panels (`bg-ink`, `text-ink-text`) are the only large dark surfaces in either theme; use them for the closing call to action, not for ordinary cards.
- Text is ink-softened (`#191B21` in light), never pure black.

## Typography

- Body and UI: Plus Jakarta Sans (`font-sans`).
- Display headlines only: Instrument Serif (`font-heading`) at weight 400, tight leading (`0.95–1.05`) and negative tracking. Never bold it — the face has one weight and faux bold looks wrong.
- Code only: JetBrains Mono (`font-mono`).
- These three are the only families. Do not set metadata, dates or UI copy in uppercase mono — labels and eyebrows are clutter. Section headings inside prose may use the display serif; body copy never does.

## Styling

- Tailwind CSS v4 only. No `App.css`, no Vite proxy.
- Icons come from `react-icons` (prefer `react-icons/fa6`); no icon fonts and no hand-written inline SVG icons. Decorative icons are `aria-hidden`.
- Buttons are rectangular with `rounded-button`, never pill-shaped. Pointer cursor globally.
- Focus uses the 4px `brand-soft` ring; icon-only controls need an `aria-label`.

## Cards

- `bg-surface` + `rounded-card` + `shadow-card`; a single hairline `border-border` is allowed where the surface needs a hard edge against the paper background.
- Editorial sections are built from hairline rules (`border-border`), plain headings and generous whitespace — not from rows of identical icon cards, eyebrow labels or decorative numbering.
- No gradients or inset edge highlights in either theme.
- Linked cards hover with a 3px lift and `shadow-card-hover`; rows lift by shifting the arrow instead.
- Inner visuals may use a faint `border-border-secondary`.

## UI components

Use the primitives in `Client/src/components/ui/` directly. Do not add wrapper components around them.

- `Card`, `Button`, `IconButton`, `Input`, `Switch`, `Alert`, `Avatar`, `Toast`, `Divider`, `CodeBlock`.
- Code samples use `CodeBlock`; its syntax colours come from the theme tokens, so never add a third-party highlighter theme stylesheet.
- Toast state lives in `context/ToastContext.jsx` and `context/toastContext.js` (`useToast`); the provider is mounted at the app root.
- Form errors are inline `Alert`s, never toasts.

## Navigation

- Never add a back button anywhere in the app. No "Back to …" buttons or links, no `bx-arrow-back` / `bx-left-arrow` navigation controls, and no history-based back actions on any page, in either the Client or the Admin.
- Upward and sideways movement comes from breadcrumbs, the wordmark and in-page links only.
- Page chrome lives in `client/src/components/layout/`: `MainLayout`, `AuthLayout`, `Navbar`, `Footer` and `Background`.
- The site header holds the wordmark on the left and only the theme toggle plus the sign-in button (or the profile menu when signed in) on the right. Do not add nav links or extra calls to action.
- Auth screens live under `/auth/login`, `/auth/register`, `/auth/forgot-password` and `/auth/reset-password`. They render without the site header and footer, and signed-in users are redirected away from them.

## Motion

- Every page must open with the shared entrance transition. Route changes in the Client use `animate-page` on the routed `<main>`; the Admin applies it to the routed page inside `AdminLayout`.
- Transitions stay short (roughly 300–450ms), use the existing easing, and are disabled under `prefers-reduced-motion`.
