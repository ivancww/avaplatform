# AVA Unified User Edit Contract v1.0

Status: **Product-owner approved UI architecture, 2026-10-29.** This document is a proposed implementation specification in an unmerged documentation PR; it does not by itself certify any App or amend the merged Mother Rules. Governing baseline: Platform main 669008e8aa5e689f08fac7a059578a6829a01702 (v1.15.3), `docs/MOTHER-RULES.md`, and `design-system/DESIGN-SYSTEM.md`. If this document conflicts with those sources, follow the governing sources and resolve the conflict before implementing.

## Scope and independence

This contract standardizes User Edit interface and behavior on each App's real customer flow. Each App owns its repository, version, deployment, workflow, allowlist, data and persistence. It does not control future independent product development, calculations, eligibility, data or business logic, and introduces no cross-App runtime dependency. EverBliss can inform interaction research but is not a design-system or product authority. Saving Admin is not a User Edit template.

## Entry and capability

- `avaEntry=frontend` opens the existing customer Frontstage without editing or Admin controls; bare or invalid entry fails safely to Frontstage.
- `avaEntry=user` opens that same flow directly in edit mode when the App genuinely supports permitted User presentation overrides. It must not merely change a label or open a separate generic settings workspace.
- `avaEntry=admin` preserves the App's separate authenticated Admin behavior. Entry parameters, client flags, visibility and local roles are not authorization.
- If presentation editing is unsupported, show a clear, non-editable explanation, preserve normal customer flow and Return to AVA, and expose no fake Save. A URL alone does not prove capability or readiness.
- Platform consumes its single canonical registry and explicit capability declarations. Do not create another runtime registry or treat a declaration as proof of tested behavior.

### Machine-checkable App declaration

The normative, App-owned declaration format, examples and tests are specified in [capability schema](user-edit-capability.schema.json) and [implementation guide](USER-EDIT-UI-v1.md#capability-declaration). Each App validates its own manifest and actual behavior locally. It is not a runtime dependency, permission grant, or replacement for Platform's canonical registry. Unsupported User Edit is explicitly declared with `entries.user=false`, empty fields, null storage and a safe direct-URL explanation; Platform must not infer support from a URL.

## UI and interaction

Use the current canonical design-system tokens, primitives, mode patterns, safe areas, touch targets and customer-presentation layout. The App header identifies App and independent version, with a persistent, keyboard-accessible **返回 AVA** action. Retain the App's existing journey, page navigation and meaningful customer content.

| State | Visible behavior |
| --- | --- |
| 編輯模式 | Identify mode, show the exact approved initial instructions in the UI specification, show clearly labelled editable controls near the content and retain the sales flow. Protected content is visibly distinct and read-only. Provide 預覽, 儲存修改 and 取消修改. |
| 預覽 | Render the same flow and geometry with pending User changes; hide editing affordances, retain material qualifications, show 預覽 and actions 返回編輯 and 儲存修改. Preview never saves. |
| Saved/use | Save only the permitted User layer, read back persisted data and report success only after verified readback; return to the normal customer flow without overwriting Official values. |
| Failure | Explain the failure accessibly, retain the pending draft, keep editing/retry available, and never announce success before readback. |

Editing, preview and cancel operate on a draft separate from the persisted snapshot. Cancel asks for confirmation when changes exist; accepting discards only this draft, retaining the last saved data; declining returns to it. On journey navigation, preview transitions and Return to AVA, preserve the draft or ask before it would be lost. Guard reload, tab close and external navigation with the browser's supported unsaved-change mechanism where feasible; browsers control the wording and cannot guarantee recovery on forced termination. Any automatic shell update must not silently discard a dirty draft. Give focus and status announcements to mode transitions, validation, confirmations and failures; controls must be labelled and usable with keyboard, visible focus, text scaling and reduced motion. Do not rely on color alone.

Responsive behavior follows the canonical Design System for phone, foldable, iPad portrait/landscape and desktop. Wrap controls and keep 44px minimum targets and safe-area insets. Do not hide global horizontal overflow. PWA and embedded WebView must preserve entry, return and draft behavior within host capabilities; record unsupported lifecycle behavior explicitly.

## Official and User presentation dual layer

**Product-owner decision approved 2026-10-29:** show Official Product Content and User-Owned Sales Presentation Content together in the same existing journey. Preserve legitimate existing personalization; never block an entire editing section merely because it contains some protected facts. Classify by source ownership, field identity, and actual meaning, not by a field name alone. A User-owned explanation is not permission to alter, contradict, conceal or replace Official product meaning or mandatory qualifications.

Official benefit values, premiums, deductibles, eligibility, claims, payment conditions, guaranteed/non-guaranteed status, timing, calculations and mandatory qualifications are read-only and remain visible where required. User-created items, additional sales explanations and personal presentation notes can be edited, ordered and deleted where genuinely User-owned and accurately presented. Official-item visibility and ordering are conditional on applicable mandatory disclosure requirements and require field-level review. Keep the App-owned allowlist and perform equivalent checks at rendering, draft, save and persisted readback boundaries; client appearance never grants authorization.

Where a legacy field mixes official facts with personal explanation, design two adjacent components in the original flow: (1) authoritative read-only Official explanation; (2) separately labelled editable User presentation explanation. Do not infer that every fragment of legacy text is safe to move to the User layer. Preserve original overrides and data until classification and a verified, reversible migration path exist. Classify ambiguous content REVIEW REQUIRED, retain it safely for inspection/recovery, and do not silently delete, overwrite, publish or display it as an authoritative fact. A migration must have documented rollback/backup and verification against existing storage contracts; where no safe mapping exists, block that dependent migration and report it. No Official data, Admin rights or Official Write permission are expanded.

## Data and security

Each App must implement and test an explicit field allowlist on both edit and save paths. Allow only App-owned User presentation overrides for explicitly identified content. Preserve official product terms, rates, calculation engines, claims, eligibility, material regulatory disclosures, official Sheet/GAS/Firebase data and Admin auth. Never convert computed or regulated values to editable copy for consistency. Preview and save must not write Official data. Existing User overrides, backups, media references and storage contracts remain intact. Untrusted editable content must be rendered safely; do not insert raw executable markup.

Financial inputs and customer/policy records are domain operations, not automatically presentation customization. Treat each according to the App's existing rules; do not present them as a persisted presentation override without a legitimate allowlist and working storage. Large media follows Mother Rules cloud/reference requirements.

## Acceptance and evidence

For each App, execute and report: direct Front/User/Admin entry and denied unauthorized Admin; permitted edit on the real page; preview without persistence; return to edit; successful save plus readback and reload; cancel, dirty navigation, failed save and draft retention; protected field and calculation regression; Return to AVA; local regression suite; responsive browser checks; and separately actual iPad/PWA/WebView and live deployment where available. Unsupported Apps instead test their explicit safe unsupported state. Capture screenshots of real candidate builds, not mockups presented as QA. Distinguish automated mocks, real browser and physical-device evidence. Use PASS / FAIL / BLOCKED / NOT VERIFIED with reason, commit SHA, test commands and links. Gemini audit and re-audit are NOT VERIFIED unless independent evidence exists.

## Supporting implementation documents

- [UI specification, state transitions, acceptance tests and declarations](USER-EDIT-UI-v1.md)
- [Seven-App source and editable-field matrix](USER-EDIT-SEVEN-APP-AUDIT.md)
- [Platform identity reconciliation](USER-EDIT-IDENTITY-AUDIT.md)
- [Seven independent implementation handoffs](USER-EDIT-HANDOFFS.md)

These documents are based on pinned source and show unresolved items explicitly. The UI architecture was approved; this unmerged specification is pending final review. The documents do not authorize a registry or identity change. No App or production readiness is inferred from them.
