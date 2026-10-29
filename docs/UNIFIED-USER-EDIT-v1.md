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

Each implementation supplies an App-owned, version-controlled JSON manifest with the fields below and a regression test that parses it, validates its structure and checks actual entry behavior and allowlist enforcement. It is evidence for tests, not a security authority, remote dependency or new Platform registry. Platform readiness is independently verified against deployed behavior.

```json
{
  "contractVersion": "1.0",
  "appId": "<existing-canonical-app-id>",
  "entries": { "frontend": true, "user": true, "admin": false },
  "userEdit": {
    "status": "supported",
    "editableFields": ["<app-owned-stable-field-id>"],
    "storage": "<existing-user-layer-description>"
  }
}
```

`entries` are booleans; `userEdit.status` is `supported` or `unsupported`; editableFields is a unique array of stable identifiers. Supported requires `entries.user=true`, at least one genuinely editable field, explicit storage and working edit/preview/save/readback. Unsupported requires an empty array and a safe unsupported experience; it must not claim a functional editing entry. Admin capability must reflect the actual authorized App implementation, not a URL or a client-side switch. Reject unknown schema versions, duplicates and malformed identifiers in tests. Do not use the manifest to grant access or to overwrite the Platform registry automatically. Apps whose canonical identity or deployment is unresolved remain blocked from integration certification.

## UI and interaction

Use the current canonical design-system tokens, primitives, mode patterns, safe areas, touch targets and customer-presentation layout. The App header identifies App and independent version, with a persistent, keyboard-accessible **返回 AVA** action. Retain the App's existing journey, page navigation and meaningful customer content.

| State | Visible behavior |
| --- | --- |
| 編輯模式 | Identify mode, briefly explain that marked content can be edited, show clearly labelled editable controls near the content and retain the sales flow. Protected content is visibly distinct and read-only. Provide 預覽, 儲存修改 and 取消修改. |
| 預覽 | Render the same flow and geometry with pending User changes; hide editing affordances, retain material qualifications, show 預覽 and actions 返回編輯 and 儲存修改. Preview never saves. |
| Saved/use | Save only the permitted User layer, read back persisted data and report success only after verified readback; return to the normal customer flow without overwriting Official values. |
| Failure | Explain the failure accessibly, retain the pending draft, keep editing/retry available, and never announce success before readback. |

Editing, preview and cancel operate on a draft separate from the persisted snapshot. Cancel asks for confirmation when changes exist; accepting discards only this draft, retaining the last saved data; declining returns to it. On journey navigation, preview transitions and Return to AVA, preserve the draft or ask before it would be lost. Guard reload, tab close and external navigation with the browser's supported unsaved-change mechanism where feasible; browsers control the wording and cannot guarantee recovery on forced termination. Any automatic shell update must not silently discard a dirty draft. Give focus and status announcements to mode transitions, validation, confirmations and failures; controls must be labelled and usable with keyboard, visible focus, text scaling and reduced motion. Do not rely on color alone.

Responsive behavior follows the canonical Design System for phone, foldable, iPad portrait/landscape and desktop. Wrap controls and keep 44px minimum targets and safe-area insets. Do not hide global horizontal overflow. PWA and embedded WebView must preserve entry, return and draft behavior within host capabilities; record unsupported lifecycle behavior explicitly.

## Data and security

Each App must implement and test an explicit field allowlist on both edit and save paths. Allow only App-owned User presentation overrides for explicitly identified content. Preserve official product terms, rates, calculation engines, claims, eligibility, material regulatory disclosures, official Sheet/GAS/Firebase data and Admin auth. Never convert computed or regulated values to editable copy for consistency. Preview and save must not write Official data. Existing User overrides, backups, media references and storage contracts remain intact. Untrusted editable content must be rendered safely; do not insert raw executable markup.

Financial inputs and customer/policy records are domain operations, not automatically presentation customization. Treat each according to the App's existing rules; do not present them as a persisted presentation override without a legitimate allowlist and working storage. Large media follows Mother Rules cloud/reference requirements.

## Acceptance and evidence

For each App, execute and report: direct Front/User/Admin entry and denied unauthorized Admin; permitted edit on the real page; preview without persistence; return to edit; successful save plus readback and reload; cancel, dirty navigation, failed save and draft retention; protected field and calculation regression; Return to AVA; local regression suite; responsive browser checks; and separately actual iPad/PWA/WebView and live deployment where available. Unsupported Apps instead test their explicit safe unsupported state. Capture screenshots of real candidate builds, not mockups presented as QA. Distinguish automated mocks, real browser and physical-device evidence. Use PASS / FAIL / BLOCKED / NOT VERIFIED with reason, commit SHA, test commands and links. Gemini audit and re-audit are NOT VERIFIED unless independent evidence exists.

## Seven-App capability inventory — investigation status

This inventory is not a grant, an implemented allowlist, or a claim of readiness. Pin and inspect the actual release branch, current code and pending changes before approving individual field IDs.

| Repository | Observed source evidence | Allowed presentation fields / readiness |
| --- | --- | --- |
| 5pay-saving-plan | Default branch is `codex/phase1-ava-saving`; main has a later release history and PR #29 is open. | NOT VERIFIED; determine deployed source, existing flow-edit storage and field allowlist before changes. |
| medical | Main at 23150e6315aef7c8589fe569d4d9626efb0b206b contains direct edit mode and P7 User controls. | NOT VERIFIED; inspect each P7 field for official/product protection, and preserve Ready/Not Ready. |
| critical-illness- | Main at 0ac762f624b362b1246152f4475fe25d5c527ff8 has a separate edit page; PR #34 is open. | NOT VERIFIED; isolate from PR #34 and inspect User preferences. |
| AVA-CRM | Default branch is `feat/ava-crm-frontstage`; main is a6b7d0497df968c4c7541d1c5b23c4e17b4c6ced and PR #16 remains open. | NOT VERIFIED; distinguish customer/policy data from actual presentation customization and verify deployment. |
| everbliss | Main at 32326656e25c171b48d5a2c72abc45c84143f331 has journey-integrated presentation field definitions. | NOT VERIFIED; inspect and test existing `PRESENTATION_FIELDS` and storage before defining exact allowlist. |
| medsave | Main at a60e889de6c186b7776598f57f249b1f95b98f1e includes legacy role/Admin UI. | NOT VERIFIED; investigate entry, privilege boundary and permitted User-owned content. |
| retiremedical | Main at 919b28a0e2928c2e26fbd8d15fd56f678acfa916 describes adjustable financial inputs; its integration test asserts no browser storage. | NOT VERIFIED; financial inputs are not proof of persisted presentation editing. |

Platform v1.15.3's canonical registry identifies 5pay, medical, critical-illness, CRM and EverBliss, but does not register the requested independent medsave and retiremedical repositories. Do not equate them with medicalreserve or an embedded adapter. Integration QA for seven independent identities is blocked until actual canonical registrations/destinations are established and tested.

The above code observations are static source inspection, not production-release verification or QA. UI reference screenshots, complete field-level matrix, exact App PRs, deployed checks and independent Gemini review remain outstanding.
