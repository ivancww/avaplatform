# AVA Design System v1 — Mother Standard

## 1. Status and scope

AVA Design System is the sole design-language and management-architecture source of truth for AVA Platform and every current or future module. Version 1 is an **audit, extraction, standardisation, and documentation release**. The production AVA shell and 5Pay do not import these styles yet, so this release makes no visual, routing, workflow, storage, PWA, backup, or restore change.

Use `tokens.css` first, then `components.css`, and then the relevant experience layer (`frontend.css` or `management.css`). New work must consume these files rather than copy 5Pay CSS or hard-code lookalike values. A later migration must be incremental and guarded by visual regression tests.

## 2. Audited baselines and authority

### AVA Platform baseline (Platform Shell authority)

- System stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang HK", "Noto Sans TC", sans-serif`; base text 14px.
- Shell canvas `#f6f8fb`; surface `#fff`; text `#172033`; secondary `#718096`; muted `#98a2b3`; border `#e7ebf1`.
- Brand `#2563eb`, hover/dark `#1d4ed8`, soft `#eff6ff`.
- Fixed 230px sidebar. Desktop main area is `calc(100% - 230px)`, max-width 1500px, padding `34px 42px 60px`.
- Page/section/card titles are 32/23/17px. Mobile page/section titles are 30/22px.
- Platform cards use 16px radius, 19px padding, and (for module cards) 136px minimum height. Settings cards use 14px radius and 15px padding.
- Controls are 42px high; secondary action controls are 38px. Shell buttons use 10px radius.
- At 1000px and below the sidebar becomes an off-canvas drawer, the main padding is `28px 24px 60px`, four-column grids become two, and split flows become one column. At 650px and below padding is `22px 16px 60px`, flow cards become one column, and the drawer becomes a bottom sheet (maximum 88vh, 22px top radius).

### 5Pay baseline (Customer-facing Frontend authority)

- Font stack: `Noto Sans TC`, `Plus Jakarta Sans`, sans-serif; weights loaded are Noto 400/500/700/900 and Jakarta 600/700/800; body line-height is 1.6.
- Canvas `#f8fafc`; surface `#fff`; text `#0f172a`; secondary `#475569`; muted `#94a3b8`; border `#e2e8f0`.
- Primary/navy `#1e3a8a`; accent `#2563eb`; soft `#eff6ff`; success `#059669`; purple `#7c3aed`; danger `#dc2626`.
- Frontend workspace max-width is 1080px; vertical margin `clamp(14px, 2.4vw, 28px)`; inline padding `clamp(12px, 2vw, 22px)`.
- Header uses `12px 24px`; its observed height establishes the 53px progress offset. Progress is 3px.
- Main content card uses 20px radius, `clamp(16px, 2.5vw, 28px)` padding, and the medium shadow.
- Question title is `clamp(22px, 2.7vw, 30px)`, weight 800, line-height 1.3. Supporting copy is `clamp(14px, 1.65vw, 18px)`, line-height 1.55.
- Guided option cards use 1.5px borders, 14px radius, `16px 20px` padding, and a 12px gap. Selected state uses accent border, soft background and a 1px accent ring.
- Previous/next buttons use `13px 20px`, 12px radius, weight 700, and 0.98rem type. Previous is white/bordered; next uses navy/white.
- Mobile begins at 699px: header padding becomes `10px 12px`, content radius becomes 16px, and touch targets in the top navigation are 34–40px. Component-specific compact grids also use 640px; two-column result arrangements stack at 768px where defined.

## 3. Typography hierarchy

Use context rather than forcing the two established products onto one font stack:

| Role | Platform Shell | Module Frontend |
| --- | --- | --- |
| Page/question | 32px, 1.2, bold/extrabold | clamp(22px, 2.7vw, 30px), 800, 1.3 |
| Section | 23px, 1.3 | content-specific, normally 1.02rem/700 option headings |
| Card | 17px | 0.98–1.02rem, 700–800 |
| Body | 14px | inherited body, 1.6 |
| Support | 12–13px, 1.45–1.55 | clamp(14px, 1.65vw, 18px), 1.55 |
| Label/meta | 10–13px, 500–700 | 0.75–0.88rem, 700 |

Do not substitute arbitrary type sizes. Use the extracted variables; module-specific data visualisations may retain their audited values until Phase 2 maps them.

## 4. Colour, spacing, radius, and shadow systems

The common accent is `#2563eb` and soft accent is `#eff6ff`, but backgrounds, text, and borders intentionally remain context tokens. The Platform Shell owns shell values; 5Pay owns customer-facing values. Semantic success, purple, and danger may communicate state, never module identity or permission.

Spacing tokens enumerate values actually present in the baselines: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 34, 42, and 60px. This is not permission to use every value everywhere: first use the component rule. Radii are the observed 6, 8, 10, 12, 14, 16, 18, 20, and mobile-sheet 22px. Shadows are shell `0 10px 28px rgba(23,32,51,.08)`, small `0 1px 3px rgba(0,0,0,.04)`, and frontend medium `0 4px 16px -2px rgba(15,23,42,.06)`.

## 5. Shared component standard

- **Cards:** white surface plus the context border. Standard shared cards use 16px radius/20px padding. Use the specific shell (16px/19px), frontend content (20px/fluid), option (14px/16×20px), or management (14px/18px) rule when applicable.
- **Buttons:** primary establishes the forward/save action; secondary establishes back/close/non-destructive action; danger is reserved for destructive action. Preserve visible focus and disabled state. Frontend previous/next fill equal available width.
- **Inputs:** full width, 42px shell height; frontend selectors that need touch room use 44px minimum. Default radius is 10px, white surface, context border, inherited type, and a blue visible focus ring. Text areas retain a 220px minimum when used as configuration editors.
- **Modal:** full viewport navy overlay at 60% opacity with 4px backdrop blur, z-index 2000; content is 92% width, max 460px, 24px padding, 18px radius. Management workspaces may use the audited 95%/980px/88vh dashboard form or full viewport in AVA embedded modes.
- **Privacy/blur:** backdrop blur separates modal context. Sensitive-value concealment is explicit and reversible via `.ava-private-value`; it must not hide required labels, actions, or workflow state, and is not a security boundary.
- **Accessibility:** interactive cards expose button/radio semantics, selection uses `aria-checked`, current pages use `aria-current="step"`, tabs use `aria-selected`, keyboard focus remains visible, and reduced-motion preference removes nonessential transitions.

## 6. Frontend Experience Standard

1. **Container/header:** use `.ava-front`, sticky `.ava-front__header`, 3px progress, and the 1080px workspace. Branding and utility actions remain concise.
2. **Title/support:** one question title followed by optional supporting text. Long Chinese/English content may wrap anywhere at title level.
3. **Options:** a vertical 12px-gap list. Entire cards are targets. Hover is accent border and near-white background; selection is accent border, soft fill, ring, and radio indicator. Selection must also be conveyed semantically.
4. **Progress/step:** progress sits below the sticky header and animates with the audited easing. Step pages enter with the audited 8px fade/translate; reduced motion disables it.
5. **Back/next:** equal-width row, 12px gap, 28px top margin. Back is secondary; next is primary navy. Button copy and navigation logic belong to the module.
6. **Fixed pages:** use the same content geometry; allow embedded/data-heavy content to overflow safely rather than compressing it. A fixed page is a presentation type, not a compulsory workflow stage.
7. **Transition pages:** use soft accent background/border to explain a change in context. They are optional and must not encode 5Pay scenario structure.
8. **Result pages:** retain standard card geometry; semantic result colours are permitted. Calculation, schema, and result composition belong to the module.
9. **Information/input cards:** use shared card/field rules, keep labels persistent, and maintain 42–44px controls. Tables or dense calculations may scroll horizontally.
10. **Responsive:** at 768px a module may stack an audited split result layout; at 699px apply frontend mobile header/card treatment; at 640px auto-fit compact grids. Avoid inventing a generic device class: iPad uses the responsive width rules, including the 768px split threshold, while the shell changes at 1000px.

## 7. Management Standard

- **Architecture:** User Management and Admin Management share workspace, navigation, tabs, forms, setting cards, status, and action placement. The module defines which controls and permissions each role receives.
- **Platform settings:** AVA shell drawers use a 390px/92vw left drawer on desktop and an 88vh bottom sheet on mobile. Back/close exits without silently saving.
- **Module management:** use the 1120px workspace with a sticky 220px sidebar and flexible content. The production 5Pay dashboard variant uses a navy header, horizontal pill tabs, scrollable body, 14px/18px setting cards, and explicit role switch.
- **Tabs:** remain horizontally scrollable, never squeezed. Active is navy/white; inactive is light surface/secondary text.
- **Forms:** group related settings in cards, keep help text adjacent, use explicit labels, and place action areas after a divider.
- **Save UI:** a Save action is explicit and primary; show pending/loading state without moving layout, then write success/failure into the reserved status region. Do not infer persistence semantics from the design system.
- **Back/close:** Close dismisses a modal; Back changes management level. Neither is styled as Save. Destructive reset/restore actions use danger treatment and confirmation.
- **Responsive:** at 700px the sidebar becomes horizontally scrollable navigation, content becomes one column, and action groups stack/wrap. Platform navigation independently changes at 1000px.

## 8. AVA versus 5Pay differences (deliberately retained)

| Rule | AVA Platform | 5Pay | v1 decision |
| --- | --- | --- | --- |
| Font | Native/system stack | Hosted Noto/Jakarta | Context-specific; shell=AVA, frontend=5Pay |
| Background | `#f6f8fb` | `#f8fafc` | Separate context tokens |
| Main text | `#172033` | `#0f172a` | Separate context tokens |
| Secondary | `#718096` | `#475569` | Separate context tokens |
| Border | `#e7ebf1` | `#e2e8f0` | Separate context tokens |
| Primary | `#2563eb` | navy `#1e3a8a` plus accent `#2563eb` | Common accent; frontend forward action remains navy |
| Page width | max 1500px after 230px sidebar | max 1080px centred | Shell and frontend keep their use-case geometry |
| Main card | 16px, usually 19px padding | 20px, fluid 16–28px padding | Component variants, not forced convergence |
| Control | 42px | commonly 44px minimum/select or 13×20px action padding | 42px base; frontend touch variant 44px |
| Responsive | 1000px tablet, 650px mobile | 768/699/640px component thresholds | Preserve each proven boundary |

## 9. Module contract

5Pay, Medsave, CI, Medical Claims, CRM, MPF, and every future AVA module **must** follow AVA Design System for design language and management architecture. Each module retains complete ownership of:

- workflow and scenario structure;
- schema and data model;
- calculations and formulae;
- business logic;
- personal and official settings;
- module-specific functionality and permissions.

5Pay is the reference implementation used to establish v1, not the long-term CSS source. Do not make 5Pay saving, Gap, Jar, Blueprint, calculation, data, or storage concepts mandatory in another module.

## 10. Source-of-truth and change policy

- Do not “copy 5Pay CSS”, approximate it in another module, or hard-code a parallel token set.
- Propose token/component changes here first, explain which authority and use case they serve, and test all consumers.
- Module exceptions must be semantic and documented; similarity is not an exception.
- v1 files use the `ava-` prefix to coexist safely with legacy classes.

## 11. Regression protection and Phase 2 migration

This phase intentionally does not import the new CSS into production. Phase 2 should:

1. add automated token/contract checks and baseline screenshots at desktop, iPad widths (including 768px), and mobile widths (699/650px boundaries);
2. migrate the AVA shell one component at a time to shell aliases, proving pixel parity before removing legacy declarations;
3. migrate 5Pay primitives to frontend aliases without changing DOM events, IDs, storage keys, calculations, GAS calls, workflow, or routing;
4. migrate User/Admin management separately, with role/permission tests;
5. validate offline/PWA precache, routing, backup/restore, and visual snapshots before each rollout;
6. only after every production consumer is migrated, treat duplicated legacy CSS as removable.

Any migration that cannot demonstrate parity remains out of scope until reviewed. The Mother Standard controls future implementation immediately; production adoption remains a regression-protected Phase 2.
