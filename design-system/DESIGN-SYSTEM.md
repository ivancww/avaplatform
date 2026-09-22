# AVA Design System — Canonical Visual Specification

## Authority and scope

This directory is the single visual implementation authority for AVA Platform, AVA Studio and every Independent App, under [Mother Rules](../docs/MOTHER-RULES.md). No Independent App is a design authority. Compose app-specific content with these shared patterns; do not create parallel fonts, palettes, components or responsive scales.

Mother Rules own architecture and ownership boundaries. This specification owns presentation. AGENTS.md owns development-agent procedures. Apps retain content, calculations, data schemas, domain workflows, formatting semantics and business logic. Visual modes and hidden controls are never authentication or authorization.

The existing AVA blue/navy identity, light canvas, white surfaces, rounded cards and restrained shadows are retained. Fonts, readable secondary text, control sizing, card geometry and responsive boundaries are normalized. This specification replaces the former split app-baseline authority and migration narrative.

This change does not migrate application markup or implement application features. Shared token changes can affect interfaces that already import the CSS. Independent App compliance is a separate task after the Mother Rules, Design System and AGENTS.md are finalized; no Independent App is a required validation baseline for this specification. Defining this system does not mean all production interfaces already conform.

## Files and consumption

| File | Responsibility |
| --- | --- |
| `tokens.css` | Primitive values, semantic roles, responsive values and compatibility aliases |
| `components.css` | Shell, typography, cards, controls, navigation, icons, states, modes and visualization |
| `frontend.css` | Frontstage composition and guided choice presentation |
| `management.css` | Studio and shared settings composition |
| `preview.html` | Isolated visual review fixture; illustrative content, no application logic |
| `validate.py` | Repeatable CSS contract and browser checks for the fixture |

Load `tokens.css`, `components.css`, then the relevant composition files. Wrap content in `.ava-shell`, `.ava-front` or `.ava-management`. These roots provide the shared font, body scale and scoped box sizing; no global application reset is imposed. Existing `--ava-shell-*`, `--ava-front-*`, numeric primitive tokens and public component classes remain available. Color/font aliases resolve to shared semantic roles; they do not establish separate themes. New code uses semantic roles rather than primitive numbers. Container widths are composition choices within this system, not per-App standards.

## Typography

The single system font stack is `--ava-font-family`: native Apple/Windows fonts with PingFang HK, Noto Sans TC and sans-serif fallbacks. No remote font download is required. Preserve user text scaling; rem values below assume the browser's default 16px root and must not be forced through a fixed root font size.

| Role | Token | Size | Weight / line height |
| --- | --- | --- | --- |
| Page / question | `--ava-type-page` | fluid 30–32px | 800 / 1.3 |
| Section | `--ava-type-section` | fluid 22–23px | 700 / 1.3 |
| Card title | `--ava-type-card` | 17px | 700 / 1.3 |
| Body / input | `--ava-type-body` | 16px | 400 / 1.6 (input 1.55) |
| Supporting text | `--ava-type-support` | 14px | 400 / 1.55 |
| Caption | `--ava-type-caption` | 12px | 400 / inherited body line height |
| Label | `--ava-type-label` | 14px | 600 / inherited body line height |
| Button | `--ava-type-button` | 16px | 700 / 1.3 |
| Key number | `--ava-type-number` | fluid 28–40px | 800 / 1.2 |
| Presentation number | `--ava-type-presentation-number` | fluid 32–48px | 800 / 1.2 |

Use `.ava-page-title`, `.ava-section-title`, `.ava-card__title`, `.ava-support`, `.ava-caption`, `.ava-label` and `.ava-metric__value`. Numeric/financial/percentage text uses `.ava-number`, `.ava-amount` or `.ava-percentage` for tabular lining figures. Labels, units, currency and period must remain visible. Domain code supplies locale, currency, precision, rounding and signs. Long text and large numbers wrap without clipping; do not shrink essential copy to fit a fixed box.

## Colors and states

All color literals belong in `tokens.css`. Semantic roles distinguish decorative borders from stronger control boundaries and distinguish success graphics from readable success text.

| Role | Token / value |
| --- | --- |
| Page | `--ava-color-background`: #f6f8fb |
| Surface / card | `--ava-color-surface`: #ffffff |
| Primary action | `--ava-color-primary`: #1e3a8a; white `--ava-color-on-primary` |
| Secondary accent | `--ava-color-secondary` → brand #2563eb |
| Primary hover | `--ava-color-primary-hover`: #172f70 |
| Text | `--ava-color-text`: #172033 |
| Supporting / muted text | `--ava-color-text-secondary`: #475569; `--ava-color-text-muted`: #64748b |
| Decorative / control border | `--ava-color-border`: #e7ebf1; `--ava-color-control-border`: #64748b |
| Hover / selected | `--ava-color-hover`, `--ava-color-selected`: #eff6ff |
| Pressed | `--ava-color-pressed`: #dbeafe |
| Focus | `--ava-color-focus`: #2563eb |
| Disabled | background #e2e8f0; text #475569 |
| Success | graphic #059669; text #047857; soft #ecfdf5 |
| Warning | #92400e; soft #fffbeb |
| Error | #dc2626; soft #fef2f2 |

Default surfaces are white. Hover feedback applies only to a hover-capable fine pointer. Pressed feedback changes the surface without moving layout. Keyboard focus uses a visible 2px outline with 2px offset. Selection combines a highlighted surface/border with a visible indicator or label and ARIA state. Disabled controls retain readable text and suppress active/hover feedback. Loading retains its label and dimensions, shows a visible pending label and uses `aria-busy="true"`; application code prevents duplicate submissions. Success/error messages use text and `.ava-status--success` / `.ava-status--error`; warnings use `.ava-status--warning`. Studio status defaults use zero-specificity `:where(.ava-management__status)`, so the shared semantic status modifiers remain authoritative whether composition styles load before or after `components.css`. Never communicate meaning through color alone.

## Spacing, sizing and layout

The reusable spacing scale is 4, 8, 12, 16, 20, 22, 24, 28, 32, 34, 42 and 60px, accessed through existing `--ava-space-*` primitives. Other existing numeric tokens remain compatibility values, not additional preferred component recipes. The 22px and 34px steps are retained canonical page-spacing values; use `--ava-page-padding-block` and `--ava-page-padding-inline` for page composition rather than selecting those primitives independently. Semantic defaults are `--ava-gap-component` 12px, `--ava-gap-section` 28px and `--ava-card-padding` 20px.

`.ava-container` is centered with a 1080px maximum; `.ava-container--wide` and Studio use 1500px. Widths include padding. Phone page padding is 16px inline / 22px block, tablet 24px / 28px, wide 42px / 34px. Shared `--ava-page-padding-left` and `--ava-page-padding-right` tokens take the maximum of responsive inline padding and the corresponding device safe-area inset. Common headers, page containers, Studio workspace and the modal backdrop use these tokens, preserving horizontal clearance on edge-to-edge phones, foldables and iPad in either orientation. The modal shell stays inside the padded backdrop; it does not apply the insets twice. Headers wrap and grow with content. Frontstage progress belongs inside its sticky header; placing it outside remains normal-flow content, avoiding an incorrect fixed-height sticky offset.

`.ava-section` groups a heading and related content. `.ava-grid` and `.ava-comparison` have one column on compact screens and two above compact; `.ava-grid--modules` has four on wide screens. Align related labels and values consistently; use start alignment for prose and tabular figures for comparisons. `.ava-scroll-region` permits intentional dense-table scrolling within the page; provide an accessible name and keyboard focus if needed. Do not hide page overflow to mask layout errors.

All controls and interactive targets have at least 44px height and icon-only buttons at least 44px width. Content can increase their size. Modals stay within the usable viewport and scroll internally, with a 460px maximum width. Consumers provide dialog semantics, accessible name, focus trap, Escape handling and focus return. CSS does not implement those behaviors.

## Cards, buttons and inputs

`.ava-card` provides 20px padding, 16px radius, a thin decorative border and small shadow. `.ava-card__header` aligns an optional icon with title/subtitle; `.ava-card__body` uses shared gaps. Information, result, fixed-content and management cards compose the same geometry. Use `.ava-card--interactive` on a native button or link for whole-card activation, never nest another interactive control inside it. Selection uses `aria-pressed` on toggle buttons; use `aria-selected` only with a role that supports it. Static cards have no hover affordance.

Buttons use the shared 44px minimum height, 10px radius, 16px horizontal padding and button typography. Primary is the main forward/save action; secondary is Back/Cancel; subtle is a low-emphasis utility; danger is destructive. `.ava-button--icon` requires an accessible name. Native `disabled` prevents activation; `aria-disabled` alone does not, so consumers must enforce it. Native links are for navigation, buttons for actions.

`.ava-field` groups a visible `.ava-label`, input/select/textarea and `.ava-help`. Labels use `for`/`id`; help and errors use `aria-describedby`. Inputs share button height/radius, a visible control border and 16px text. Textareas start at 220px and resize vertically. Set `aria-invalid="true"` and show the specific error in text. Read-only content must be distinguishable from disabled content and remain selectable. Do not use placeholder text instead of a label. Save feedback occupies a reserved `.ava-status` region; use a suitable live-region role without announcing every keystroke.

## Navigation and icons

`.ava-nav` and `.ava-nav__item` share button sizing, gaps and focus treatment. Current destination uses `aria-current="page"`, blue text and a soft selected surface. Module entries compose the shared interactive card with a consistent icon, title and short description. Back uses the secondary presentation with a directional icon plus text where space permits. Close dismisses a surface; neither action is presented as Save. Navigation destinations, unsaved-change handling and permission checks belong to application code.

Studio uses the same active language in its sidebar; tabs use `aria-selected` and navy fill. Consumers implement tab roles, roving focus and keyboard behavior. Below the wide boundary the sidebar becomes a horizontal, locally scrollable navigation row; tabs never shrink into unreadable targets.

UI icons use one outlined SVG language: currentColor, 20px default, 24px large, 2-unit stroke, round caps/joins and consistent viewBox geometry. `.ava-icon` aligns within controls; `.ava-card__icon` uses a 44px soft-accent container. Decorative icons have `aria-hidden="true"`; meaningful standalone icons need an accessible name. Do not mix emoji and SVG for the same UI role. Emoji may occur as explicitly authored content, not as substitute navigation/action icons. Existing AVA logo assets remain brand assets, not recolored UI icons.

## One responsive system

| Range | Layout |
| --- | --- |
| Compact: up to 650px | Phone / folded phone; one column, stacked action groups, wrapping headers |
| Medium: above 650px through 1000px | Tablet-like / unfolded phone / typical iPad portrait; two-column content where appropriate, horizontal workspace navigation |
| Wide: above 1000px | Typical iPad landscape / larger screens; two-column comparisons, up to four module columns, 230px workspace sidebar |

These are viewport ranges, not device detection. Split-screen iPad and folded/unfolded devices use the range their usable viewport provides. Fluid typography and minimum-width-zero grid tracks operate between boundaries. Apps must not add independent responsive scales. Breakpoint tokens document the contract; media query literals mirror them because CSS custom properties cannot be interpolated into media conditions. Test both sides of each boundary. Preserve scrolling, focus visibility, readable copy and usable controls with zoom and long content. Respect reduced-motion preferences.

## AVA experience modes

Modes support **Easy for Agent → Natural Conversation → Instant Visualization → Easy for Customer**. The actual production Frontstage is the App's working/customer-facing surface. **User = Frontstage + User Editing permission**: where editing is permitted, use the same Frontstage for direct edits, Preview and Save Local. Do not create a duplicated User Workspace just to edit Frontstage content. Admin is a separate capability using AVA Studio's shared management pattern; User Edit Mode does not replace AVA Studio. Use one working content surface with `data-ava-mode="use|edit|preview|presentation"`; modes do not require duplicate workspaces.

| Mode | Shared presentation |
| --- | --- |
| Use | Independent App's actual production Frontstage; minimal necessary input, clear choices and immediate useful visualization; edit controls hidden |
| Edit | Directly edit permitted content on the actual Frontstage, with labelled editable regions, visible mode bar and explicit Preview / Save Local / Cancel controls |
| Preview | Same Frontstage customer content geometry, visible preview label and Return to Edit / Save Local actions; edit-only affordances hidden |
| Customer Presentation | One concept and prominent key figures, short explanation, essential comparison and clear exit; agent-only chrome hidden |

`.ava-mode-bar`, `.ava-editable`, `.ava-edit-only` and `.ava-agent-only` provide these styles. The consumer labels the current mode and controls transitions, unsaved data, focus and persistence. Save Local writes only permitted User/Local overrides. Official Cloud, Google Sheet or Admin-controlled values remain read-only in User Edit Mode unless the owning App explicitly declares a field user-editable. Preview must not silently save. Presentation must preserve material qualifications, units and assumptions; do not hide essential customer information as agent-only chrome. The presentation exit must remain outside `.ava-agent-only`. These classes are visual helpers, not privacy/access controls. `.ava-private-value` is an explicit visual blur only; it does not remove data from the DOM or accessibility tree.

AVA Studio is the shared Admin management pattern. Independent Apps may supply app-owned official configuration, datasets, calculation parameters, mapping, cloud defaults and publishing controls through that pattern. Shared management styles do not transfer ownership of these functions/data and User Edit Mode does not replace Admin controls.

## Visualization presentation

- **Key numbers / amounts / percentages:** `.ava-metric` groups a label, prominent `.ava-metric__value` and `.ava-metric__unit`. Include currency, period and units explicitly; domain code owns the value and precision.
- **Progress:** `.ava-bar` / `.ava-bar__fill` or Frontstage progress use a consumer-supplied `--ava-visual-value` percentage. Provide visible textual progress and accessible progress semantics; indeterminate progress must not show a fabricated percentage.
- **Gap:** `.ava-bar__gap` uses a warning tint and dashed boundary to distinguish the remaining segment without relying only on color. Label covered/remaining amounts and total. The App supplies all amounts and the ratio; CSS only clamps the drawn width to its bounds and never changes the displayed data.
- **Comparison:** `.ava-comparison` aligns equal cards with the same metric order, units and scale. Compact screens stack cards. Chart axes and domains must be labelled and comparable; avoid misleading truncation. Offer an equivalent textual summary or table.
- **Summary/results:** `.ava-result-card` uses common card hierarchy, a primary conclusion, key figures and brief supporting information. Color does not imply a business outcome without an explicit label.
- **One screen / one concept:** `.ava-concept` groups a concise heading, visualization and necessary explanation. Aim for one clear concept, but allow vertical scrolling for small screens, zoom or qualifications; never clip required content to force a single viewport.

Charts with unique domain needs may use app-specific composition, but consume shared typography, color, spacing, labels and states. This system does not define formulas, financial advice, thresholds, data aggregation, business workflow or chart data.

## Validation and adoption boundary

Run `python3 design-system/validate.py` with `tinycss2` and Playwright available and installed browser runtimes. The isolated fixture tests shared presentation without production cloud dependencies. Browser emulation is not physical iPad Safari certification. Actual application workflows, authentication, data and deployment remain separate acceptance tasks. Never infer full ecosystem adoption from a passing fixture.
