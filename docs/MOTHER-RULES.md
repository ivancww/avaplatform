# AVA Platform — Mother Rules

## 16. Independent App Admin Integration Security Standard

Every Independent App declaring AVA Studio Admin MUST use the reusable `ava-admin-session-v1` contract by default: one AVA Studio password login, a valid Platform Admin session, an App-scoped one-time ticket and nonce, retained-opener browser proof, origin/App ID/expiry validation, one-time consumption, replay rejection, and server-side Official authorization. An App may use a separately documented, time-bounded legacy compatibility contract only when the Platform has approved that record and the legacy flow preserves equivalent App binding, expiry, one-time/replay protection, server-side verification, and fail-closed behavior. Copied Admin URLs, query strings, frontend flags, or `avaEntry=admin` MUST NOT independently grant access. No second login, exposed secret, browser-proof removal, or undocumented legacy security downgrade is permitted.

Each App MUST inspect its complete production GAS project and deployed version: one effective `doGet`, one effective `doPost`, correct POST routing, complete referenced functions, Script Properties by key, Platform endpoint, App ID, and request/response contract. Preserve existing business logic, Google Sheets, Official Data, deployment URL, and read/write behavior.

Record source/deployment equivalence, GAS routing, Platform compatibility, server-side exchange, Official Read, browser-bound launch/return, negative security tests, and deployment verification as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`. A server-side diagnostic is not browser E2E; Google redirect or Cloud Browser restrictions are `BLOCKED`, not App authorization failures.

These are the canonical target-state architecture and experience principles for AVA Platform and every current or future Independent App in the AVA ecosystem. AVA Platform is the Mother Platform and the overall working platform.

The Mother Rules define architectural authority and principles. The [AVA Design System](../design-system/DESIGN-SYSTEM.md) defines the actual shared visual specification. Development-agent enforcement belongs in [AGENTS.md](../AGENTS.md). For target-state architecture, these Mother Rules take precedence over conflicting architectural statements in other documents. Implementation descriptions and historical app baselines do not establish architectural authority.

Document responsibilities remain distinct:

- **Mother Rules:** architecture and experience principles, ownership boundaries, and Platform versus App responsibilities.
- **Design System:** actual visual specifications, typography and color values, spacing, cards, components, responsive visual rules, and UI states.
- **AGENTS.md:** instructions governing how development agents study, implement, test, and enforce the Mother Rules and Design System.
- **App-specific documentation:** Business Logic, Data, Content, Calculations, domain workflow, and unique App functions.

This is a target-state specification, not a claim that the capabilities described here are already implemented.

## 1. AVA Platform Is the Mother Platform

AVA Platform is the central platform of the AVA ecosystem. It owns common cross-app capabilities and standards. Independent Apps remain independent functional modules with independent source code and repositories; integration does not absorb their source code or business logic into AVA Platform.

Common platform capabilities must not be unnecessarily duplicated inside every Independent App. No Independent App is the Mother Platform or an architectural authority for another App.

## 2. Clear Separation of Responsibilities

Cross-app capability belongs to AVA Platform. App-specific capability belongs to the Independent App.

AVA Platform owns shared platform architecture, module registration, discovery and launch, navigation, permissions, visibility, platform services, common identity/context where applicable, integration contracts, and Area / Preference configuration. Modules use this common architecture rather than establishing parallel registration or preference systems. Registration identifies the module and its applicable destinations, category / area, icon, ordering, display preferences, and role visibility. AVA Platform does not absorb or copy Independent App source code to provide these shared capabilities.

Independent Apps remain independent repositories/modules and own their unique Business Logic, calculations, app-specific Data and Content, domain workflow, functions, cloud datasets, and configuration. Each App has its actual production Frontstage: its working and customer-facing experience where app-specific workflows, calculations, presentations, and results belong. Frontstage use, user customization, and official administration are distinct responsibilities, but do not require three duplicated interfaces inside each App. Entry points reflect the applicable experience and route users to the appropriate destination. Visibility and access respect the relevant role, permission, preference, and area configuration; enabling a module does not grant administrative access.

Every Independent App must provide a persistent, clearly identifiable **「返回 AVA」 / “Return to AVA”** navigation control on its primary Frontstage/home surface. Activating it must return the user to AVA Platform. Browser Back, browser chrome, manually entering a URL, and device/system navigation are not substitutes for this control. Missing Return to AVA is an AVA Mother Standard compliance failure. This is a navigation and integration requirement only: Independent Apps remain independent modules and repositories, and the control must not absorb or duplicate their source code, business logic, data, or workflows.

### Mandatory Independent App Platform Entry Contract

Every Customer-facing Independent App intended for AVA Platform integration must implement and verify this contract in its own independent deployment before AVA Platform enables the corresponding capability. The contract applies to current migrations and to every future App unless its App type is explicitly exempted.

- **Frontstage:** `?avaEntry=frontend` opens the normal customer-facing production Frontstage. A bare production URL may safely default to the same Frontstage. It must not expose development-only controls or inappropriate Admin controls.
- **User / 我的流程:** `?avaEntry=user` opens that same actual production Frontstage in User Edit Mode. The required sequence is **Frontstage → Edit → direct editing of the customer-facing experience → Preview → Save Local → normal Frontstage**. User mode must not create a duplicated User Workspace, a second App copy, or a generic settings console that replaces direct Frontstage editing.
- **Admin:** `?avaEntry=admin` is available only when the App declares and implements the required Official/Admin configuration. Admin is capability- and permission-based and is responsible for Official Layer configuration only. When unsupported, the App declares `admin: false`; Platform must not fabricate or infer an Admin route, and the entry must fail safely.

The User Layer may control only App-permitted local overrides, including titles, subtitles, support text, visibility, ordering, User-created Pages or content, Media references, presentation settings, and allowed flow overrides. User mode must not modify protected Official Layer data such as Business Logic, Calculation Logic, protected product parameters, Official Cloud Defaults, protected GAS configuration, or Admin-only configuration. Save behavior remains Local-first, and saved User Overrides must survive reopen and reload without being silently replaced by Official refresh.

The Platform registry is an explicit capability contract for each registered App. It must declare at least `frontend`, `user`, and `admin` capability flags (for example, `capabilities: { frontend: true, user: false, admin: false }`). `frontend` is required for a Customer-facing App; `user` and `admin` are enabled only after their applicable checks pass. Platform must not infer unsupported capabilities, enable an entry merely because a URL can be constructed, or expose a route that the target App has not implemented and verified. The target App owns its entry implementation and verification; Platform owns common registration, navigation, visibility, permission, and integration standards.

### Register Once → Front → User → Admin

The canonical Platform App Registry is the single App-definition source for Platform discovery and routing. Register an Independent App once; derive Front, User, and AVA Studio Admin directories from that registration by filtering its declared capabilities and launching its canonical `entryModes.frontend`, `entryModes.user`, or `entryModes.admin` destination. Front, User, and Admin may have different presentation and organization, but Platform must not maintain three separately authored App lists or duplicate an App's editor. Homepage Area / Folder / order and User visibility preferences organize available Apps; they do not unregister an App or change its capabilities. Adding a correctly registered future App must not require a new Platform routing branch or hardcoded surface card.

Every integrated App must provide a persistent, reliable Return to AVA control on required primary surfaces, using the approved AVA Platform production destination. It must be reachable through the real entry path, usable with keyboard/focus, responsive and safe-area compatible, and meet the canonical touch-target requirement. Browser Back is not a substitute. Return to AVA is navigation only and does not transfer App ownership to Platform.

### Integration Readiness Gate

An Independent App must not be described as fully Platform-integrated, or have a corresponding Platform capability enabled, until the applicable checks pass in the live deployment:

1. Live deployment is reachable.
2. Front entry works and opens the production Frontstage.
3. User entry works.
4. User entry opens the actual Frontstage in Edit Mode.
5. Edit → Preview works.
6. Save Local works.
7. Saved User Overrides survive reopen and reload.
8. Return to AVA works from required primary surfaces.
9. Responsive requirements pass across the applicable AVA device classes.
10. Installed-PWA navigation is compatible with the AVA browsing-context and scope model.
11. No unintended horizontal overflow exists.
12. Independent Repository, Source, Deployment, Product Logic, and Workflow ownership is preserved.
13. Official Layer and User Layer separation is preserved across rendering, refresh, backup, restore, and persistence.
14. Unsupported capabilities fail safely without fabricated routes or unsafe fallback behavior.
15. The Automatic Official App Shell Update Gate below passes for every applicable deployment.

Admin entry is required only when the App declares Admin capability. If `admin: true` is declared, `?avaEntry=admin` must pass live verification before Platform enables it. The normal sequence is **Independent App implementation → Independent App tests → Independent App review and merge → live deployment verification → Platform registration/update → Platform integration tests → Platform review and merge**.

Existing Apps are not retroactively declared compliant by this standard and must not lose working functionality solely because an audit is incomplete. They may require a later migration or audit against this contract. Future Customer-facing Apps must implement Front, User/Edit, Preview, Save Local, persistence, Return to AVA, responsive behavior, and installed-PWA compatibility from initial implementation before Platform integration.

### Automatic Official App Shell Update Standard

An Official App Shell is the deployed executable/runtime surface of an App: its
HTML, JavaScript, CSS, manifest, service worker and other resources required to
open the App. It is separate from Official datasets and their version
coordination. A dataset refresh updates Official data owned by an App; a Shell
update discovers and activates a newer deployed App runtime. Neither requires
the other App or the Platform to change a version first.

AVA Platform owns the Platform deployment and Shell update lifecycle. Each
Independent App owns its own deployment and Shell update lifecycle. A Platform
deployment updates Platform; a Saving, Medical, Critical Illness, Retire or
future App deployment updates that App. No App Shell version may be coupled to
another repository's Shell version, and the Central Official Version Manifest
must not be required to discover a newer deployed App Shell.

AVA Platform's Service Worker must not cache, substitute, or serve Platform
App Shell responses for independently deployed Independent App paths. Platform
owned Shell fallback applies only to Platform-owned paths. Independent App App
Shell lifecycle is owned by each Independent App. A normal Independent App App
Shell release must not require an AVA Platform release, Platform registry
SHA/version change, Official Dataset manifest change, or Update Notification
publication.

For every applicable browser and installed-PWA deployment, an Official
deployment must be discoverable automatically when the User later opens or
reopens that same deployment. The newest valid Shell must become active safely
without requiring cache clearing, site-data deletion, PWA reinstall, a manual
`?v=` query parameter, repeated manual refresh, a supplied version number, or a
developer-maintained per-release cache/version string. Deployment identity may
be generated by the deployment system—such as a commit SHA, deployment ID,
generated asset revision or timestamp—when the implementation needs it; the
Mother Rule defines the outcome, not one implementation.

Where a Service Worker or App Shell cache is used, its contract must ensure:

- navigation or another equivalent update check can discover the newest
  deployment rather than being indefinitely trapped in an old document;
- a newly deployed worker is automatically discoverable and can safely activate;
- old Shell caches retire without deleting unrelated origins, Apps, datasets or
  User storage;
- offline use may fall back to the last valid Shell, but a later network
  opportunity and reopen/update check can discover the newest Shell;
- standalone and normal browser launches use the same safe update lifecycle;
- any activation/controller-change reload is bounded to at most once for that
  update cycle, with no reload loop or refresh storm.

Shell update maintenance must preserve the User/Local Layer. It must not call
blanket `localStorage.clear()`, `indexedDB.deleteDatabase()`, or equivalent
browser-storage deletion as a cache strategy. LocalStorage User Overrides,
IndexedDB structured data, User Pages, ordering, visibility, presentation
settings, local configuration, backup references, and App-specific Local-first
data remain intact. Cache cleanup may remove only the App Shell resources and
cache names owned by that deployment, while preserving the Official Layer/User
Layer separation.

The mandatory **Automatic Official Update Gate** is evaluated per applicable
App and deployment as `PASS`, `FAIL`, `BLOCKED`, `NOT APPLICABLE`, or `NOT
VERIFIED`:

- newest Official deployment is automatically discoverable;
- no cache clearing, `?v=` cache buster, PWA reinstall, or repeated manual
  refresh is required;
- no manually maintained per-release cache/version bump is required;
- stale Service Workers cannot indefinitely lock the old Shell and old Shell
  caches retire safely;
- normal browser, mobile browser, iPhone/iPad Safari class, Android Chrome
  class, tablet, foldable responsive class, and installed-PWA behavior are
  validated where applicable;
- no reload loop occurs;
- LocalStorage, IndexedDB, User Overrides and other applicable User/Local data
  survive the Shell update;
- the App's update lifecycle remains independent from AVA Platform and every
  other Independent App.

An App must not be reported as fully Integration Ready when an applicable gate
item is `FAIL` or `BLOCKED`. Unexecuted physical or deployment checks remain
`NOT VERIFIED`; desktop inspection or static code review is not physical-device
certification. Existing Apps enter this check at their next audit, development
or Integration Readiness preparation, implement the minimum App-specific
correction if needed, and validate it in an App-owned PR. Future Apps must
implement and validate this behavior from their initial applicable build and
integration-readiness process.

### Official Homepage Toolbox Restore Contract

Any registered Official / Independent App exposed in the AVA Homepage Toolbox must use the generic AVA Platform Homepage restore mechanism. **Toolbox → 加回首頁** must never require App-specific restore code, branching, or a second Homepage implementation. This contract applies to all current registered Apps and every future App added to the Platform registry.

The generic restore mechanism must:

- preserve a valid previous User Area, Folder, and order;
- repair or clear stale, deleted, invalid, or inconsistent Folder references and Folder membership, then guarantee a visible valid Homepage placement;
- use the Official/App default Area when no valid previous placement exists, and fall back safely to Area 1 when no valid default Area exists;
- render the restored App immediately, persist the User Layer placement through save and reload/reopen, keep the App unique, and make Toolbox show 「已在首頁」;
- preserve other Homepage Apps, User Area names, valid Folders, ordering, Personal Cards, User Overrides, and Official Layer / User Layer separation.

Restoration changes only the User Layer placement and visibility override. It must not publish or mutate Official Cloud Defaults, App Business Logic, calculations, data, or workflows. The Platform production path must call this generic mechanism using the registered App identity and reconciled Official/App default metadata; it must not contain Medical-, Saving-, Critical-Illness-, or other App-specific restore branches.

## 3. Single AVA Design System

There is only one AVA Design System. It is the Single Source of Truth for shared UI and UX presentation across AVA Platform, AVA Studio, and every Independent App, including:

- Typography, colors, spacing, and layout.
- Cards, buttons, inputs, navigation, and icons.
- Interaction states and shared visual components.
- Responsive behaviour and visualization presentation.
- Edit / Preview / Presentation modes.

Independent Apps must not create competing design systems. No Independent App is the design authority for another Independent App. An implementation reference does not become a UI standard.

Mother Rules establish this authority and the experience principles. Specific visual values, tokens, component implementations, and responsive specifications belong in the AVA Design System.

### Independent App Frontstage UI Shell Standard

Every Independent App composes one reusable AVA family shell around its own
product journey. The shell is shared presentation and navigation; the journey
remains App-owned:

**SHARED AVA FAMILY SHELL + INDEPENDENT PRODUCT JOURNEY**

The shell must make AVA and the Independent App identifiable without making
the App appear to be a Platform-owned copy. The App supplies its own journey,
content, calculations, Official data, user workflow, and domain presentation.
The shell supplies the following reusable structure and behavior.

- **Page background:** Use the AVA Design System page/background semantic role
  and a readable text role. The default surface is not a full-bleed App brand
  color; content surfaces remain distinguishable from the page.
- **AVA and App identity:** The primary shell identifies AVA as the family and
  the Independent App as the current product. A compact AVA eyebrow/brand
  treatment may sit above the App identity; it must not replace a clear App
  name.
- **App name hierarchy:** The App name is the primary page/header identity,
  with an optional concise descriptor below it. Domain page titles and journey
  headings follow the shared typography hierarchy rather than competing with
  the shell identity.
- **Persistent Return to AVA:** The primary Frontstage/home surface keeps a
  visible, labelled 「返回 AVA」 / “Return to AVA” control. It is a real link or
  navigation action to the registered AVA destination, remains outside
  agent-only chrome, and is usable with keyboard focus, text scaling, safe
  areas, and the canonical 44px minimum touch target. Browser Back and browser
  chrome are never substitutes.
- **Header structure and spacing:** Use a responsive header with App identity
  grouped on one side and Return to AVA plus optional product actions grouped
  on the other. The header may be sticky when useful, uses the shared surface,
  border, and focus treatment, wraps when needed, and grows with content; it
  must not clip or force horizontal scrolling.
- **Optional product actions:** App-specific actions such as Edit, Help,
  Share, or a journey action may appear only when applicable and permitted.
  They use shared AVA controls and must not displace, hide, or visually weaken
  Return to AVA. Admin actions remain permission-controlled and are not
  granted by shell presentation.
- **Main content width:** Center the Frontstage content in the canonical AVA
  container defined by the Design System. Focused product journeys should use
  the standard container; wider layouts are allowed only when the App's
  content genuinely requires them and must still use the Design System
  container rules.
- **Responsive gutters:** Use the shared responsive page padding: compact
  phone/folded layouts use the compact gutter, medium/tablet and unfolded
  layouts use the medium gutter, and wide layouts use the wide gutter. Apply
  the corresponding horizontal safe-area inset through the shared tokens;
  do not create App-specific gutter scales.
- **Typography hierarchy:** Use the AVA font stack and semantic roles for
  page, section, card, body, supporting, label, button, and key-number text.
  Headings, labels, units, periods, and qualifications remain readable under
  text scaling and long localized content.
- **Cards and containers:** Content cards and containers use the shared white
  surface, decorative/control border roles, spacing scale, and card geometry.
  Cards organize the Independent App journey; they do not imply that App
  data or calculations are Platform-owned.
- **Buttons and controls:** Use the shared button/input patterns, visible
  labels, focus states, disabled/loading/error/success states, and at least
  44px interactive targets. Native links are used for navigation and buttons
  for actions. Icon-only controls require an accessible name.
- **Radius, border, and shadow:** Use canonical semantic tokens and shared
  component geometry. The normal family language is restrained rounded
  surfaces, thin borders, and a small elevation shadow; App code must not
  introduce a competing radius, border, or shadow system.
- **Vertical rhythm:** Compose sections using the AVA spacing scale. Keep
  header-to-content, section, card, label-to-control, and action-group gaps
  consistent; allow content to grow vertically rather than compressing or
  clipping required text.
- **Safe areas:** Headers, page containers, sticky controls, dialogs, and the
  persistent Return to AVA control respect top, bottom, left, and right
  `env(safe-area-inset-*)` requirements. Safe-area padding must not be applied
  twice by nested shells.
- **Browser and installed PWA:** The same Frontstage shell and navigation
  contract applies in a normal browser and the App's installed PWA context.
  The App's manifest, scope, service worker, and shell lifecycle remain
  App-owned and must not change the AVA family presentation or remove Return
  to AVA. Do not depend on browser chrome, browser Back, or a particular
  viewport height.
- **Device adaptation:** Use the shared viewport ranges for phone, folded
  foldable, unfolded foldable, iPad portrait, iPad landscape, split-screen,
  and larger screens. Stack or reflow identity, actions, cards, comparisons,
  and forms at the shared boundaries; do not create device-specific duplicate
  journeys or responsive scales.
- **No horizontal overflow:** Grid tracks use minimum-width-safe behavior;
  long names, numbers, controls, dialogs, tables, and localized content wrap
  or use an intentional accessible scroll region. Never hide page overflow to
  disguise a shell defect.

These rules define the family shell only. Medical-specific Ready / Not Ready
journeys, Medical cards, Medical Official Data, Medical calculations, and
Medical business logic remain in the Medical Independent App. The same
boundary applies to Saving, Critical Illness, CRM, Recruit, and future Apps:
each App reuses the shell principles while owning its own product journey and
repository.

### Customer Presentation Framework — structural contract

Customer-facing Independent Apps share a recognizable AVA presentation skeleton while preserving App-owned Product Journeys:

**SAME AVA SKELETON + DIFFERENT PRODUCT CONTENT**

The shared skeleton owns visual language, App Header structure, App/Journey identity, the Independent App's own version beside that identity, Return to AVA presentation, Page Control / Journey Back presentation, Main Presentation hierarchy, shared card/control language, typography, spacing, responsive behavior, safe areas, and customer-facing presentation rules. Product content, calculations, Business Logic, Official Data, journey semantics, specialized components, interaction behavior, card dimensions, and App version/release lifecycle remain App-owned and adaptive.

The canonical concrete layout, navigation, choice-layout, Direct Advance versus Explicit Next, responsive, overflow, and review requirements are defined by the [AVA Design System Customer Presentation Framework](../design-system/DESIGN-SYSTEM.md#customer-presentation-framework--concrete-layout--navigation-contract). Platform Version and Independent App Version are separate values; an App Shell release does not require a Platform release. **PRODUCT LOGIC HAS PRIORITY OVER VISUAL SIMILARITY.** Medical may be used as a current mature visual reference, but it is not the source of truth and its questions, counts, card dimensions, Product Flow, calculations, Official Data, or Business Logic must not be copied into another App merely to achieve visual consistency.

Applying the shared presentation structure must not change Product Logic, Calculation Logic, Business Logic, Official Data, protected parameters, Customer Journey meaning, or a legitimate specialized interaction. If the shared structure appears to require such a product change, stop that dependent change, document the affected page/component and conflict, and escalate for a Mother/Product decision.

### Independent App shell migration and compliance contract

An existing Independent App adopts this standard through an App-owned audit
and change set. The canonical sequence is:

**Latest AVA Mother Standard → audit the existing Independent App shell →
identify shell-only compliance gaps → preserve Product / Journey / Business /
Calculation / Data logic → modify only non-compliant shell and UI elements →
validate Front / User / Admin entry modes → validate Return to AVA → validate
responsive, browser, and installed-PWA behavior → Independent App PR → stop
for review.**

The audit and migration must preserve the App's Product Journey, Business
Logic, calculations, Data, Content, schema, domain workflow, permissions, and
deployment ownership. A compliant Product Journey must not be rewritten merely
to make Independent Apps visually identical. The objective remains:

**CONSISTENT AVA FAMILY SHELL + INDEPENDENT PRODUCT JOURNEYS**

Each Independent App implements the shell locally in its own repository. This
standard does not require runtime UI imports from `avaplatform`, shared
cross-repository application code, or runtime coupling between repositories.
Each App remains independently sourced, deployed, versioned, and updated.

Migration compliance includes the applicable Platform Entry Contract:
`?avaEntry=frontend` must open the real customer Frontstage,
`?avaEntry=user` must edit that same Frontstage through Edit → Preview → Save
Local, and `?avaEntry=admin` is validated only when the App declares and
implements Admin capability. The audit must also verify the persistent Return
to AVA control, responsive behavior, browser and installed-PWA behavior, no
horizontal overflow, Official/User separation, Local-first User Overrides,
and the Automatic Official App Shell Update Gate where applicable. The App's
own PR is the stopping point for this migration; Platform registration or
integration review is a separate subsequent decision.

## 4. Frontstage-First Application Experience

Each Independent App's actual production Frontstage is its real working/customer-facing experience. Where user customization is required, the canonical User model is:

Frontstage → Edit → direct editing on the actual Frontstage → Preview → Save Local

**User = Frontstage + User Editing permission.** Where the owning module permits, the User may edit page text/content, add, delete, reorder/move, show/hide pages, modify local preferences, preview changes, save local overrides, or reset permitted local overrides. These edits belong to the User/Local Layer. Official Cloud, Google Sheet, and Admin-controlled data remain read-only to Users unless the owning module explicitly declares a field user-editable. Do not create a duplicated User Workspace merely to edit Frontstage content. Shared user settings belong to Platform services; app-specific editing remains directly on or close to the relevant Frontstage content/function.

## 5. AVA Studio Is the Official Admin Workspace

AVA Studio is the common administrative workspace and management pattern for Official AVA configuration and Official Cloud data. It manages and publishes Official Defaults and shared official configuration where appropriate. Admin is a separate administrative capability; do not replace AVA Studio with User Edit Mode. Independent Apps may own app-specific Admin functions—such as official App configuration, Google Sheet/GAS configuration, datasets, calculation parameters, mapping tables, cloud defaults, and publishing/synchronization controls—but these follow the AVA Studio management pattern and canonical Design System. The Independent App continues to own those functions and data; common management presentation and access conventions are defined by AVA Platform. Administrative functionality must not be unnecessarily duplicated inside each Independent App.

A person may simultaneously be an AVA User and an authorized Admin. User identity persists independently of Admin authorization. AVA Studio Admin authorization operates as a separate authenticated permission/session. Admin authentication grants administrative permission; entering AVA Studio must not replace, delete, or transform the person's User identity. Ending Admin authorization also preserves that User identity.

The reusable Platform contract for this separate authorization is defined in [AVA Studio Admin Authentication Contract](ava-studio-admin-authentication.md). `?avaEntry=admin` is routing/capability selection only; it is never authentication. Independent App Admin UI and Official-data writes require a Platform-authorized, App-bound grant verified by the App backend.

AVA Studio is Cloud-first for Official administrative data. An authorized Admin should be able to use AVA Studio from different authorized devices, including phone and iPad, and access the same current Official Cloud state. Official Admin changes are intended to synchronize across devices through the Official Cloud. Administrative access remains subject to authentication and permissions on each device.

PWA installation is a UX and runtime requirement for the normal AVA Platform Front/User experience; it is not an AVA Studio authentication or security primitive. Platform may provide a dedicated browser-accessible Admin route that bypasses only the PWA installation guidance and normal User onboarding. That route provides navigation only: it must still require the same Unified Admin password authentication, server-controlled Admin session, App-bound one-time launch ticket, App grant verification, expiry, logout, and revocation controls. It must not mark the browser as installed, create Admin authority from a query parameter, expose normal Front/User functionality, or introduce a second Admin authentication system.

## 6. Official Layer and User Layer Must Remain Separate

The Official Layer contains Official Defaults, official configuration, and centrally published data. A Local Official Cache represents Official data locally; it does not become User data merely because it is stored on a device.

The User Layer contains user-specific settings, edits, overrides, and local working data. Official Cloud updates must never silently overwrite User Overrides. When a User Override exists, the User Layer takes precedence for that user's rendered experience unless the user explicitly resets or removes the override.

Official publication and refresh update the Official Layer while preserving the User Layer. User customization does not implicitly publish or change Official Cloud data. This separation applies to rendering, initialization, refresh, backup, and restore.

### Verified Official Data Sync and Official Write Standard

The Platform standard defines the required evidence and safety semantics for
Official Data synchronization. It does not prescribe an App's dataset names,
field names, Sheet layout, revision hash algorithm, GAS function names, or
frontend component structure. Each Independent App remains the owner of its
Official Data source, schema, business validation, and deployment.

For every App that exposes an Official Admin surface:

1. AVA Studio is the common Admin gateway. Platform remains the server-side
   authority for the applicable App authorization contract; a valid Admin
   launch is not by itself proof that an Official write is authorized.
2. The App keeps its own authorized GAS/backend and Official Data source.
   Google Sheets, Script Properties, deployment URL, and App business logic
   remain App-owned and are not copied into Platform.
3. Official GET responses expose a canonical dataset revision whenever
   mutation concurrency or stale-data detection requires one. The same
   server-side source of truth must be used as the expected-revision basis for
   mutation; a frontend-generated revision or a version-only substitute is not
   sufficient.
4. Every Official write validates the App-specific authorization, App ID,
   operation, expiry/replay rules, stable record ID, field allowlist, business
   rules, and expected revision on the server. A stale or conflicting revision
   fails closed.
5. The server must perform read-after-write verification using the same
   App-owned Official source. The confirmation must identify the requested
   dataset and
   stable record, include a valid canonical revision and persisted snapshot, and
   confirm every submitted changed field against the persisted record. A
   lock, transaction, or equivalent concurrency control must remain in force
   for the App's implementation.
6. The frontend may display a successful Official synchronization result only
   after complete matching mutation evidence is returned. HTTP 200,
   `success: true`, or a transport-level acknowledgement alone is never
   proof of persistence.
7. Failed, rejected, incomplete, mismatched, stale, or unverified writes must
   not update the confirmed Official cache or mark the user's edits as saved.
   The App should retain the draft safely and show a user-safe error. It must
   not silently retry a production Official write.
8. Official Data and User Overrides remain separate during initialization,
   refresh, backup, restore, mutation confirmation, and rendering. Official
   refresh must not silently overwrite User data.
9. Production verification records Official Read, Official Write persistence,
   browser/PWA Admin launch, Return to AVA, and security negative tests as
   independent gates. Source tests and mocked responses do not upgrade a
   production persistence gate to PASS.
10. Any production-facing App change—including Admin UI, authorization,
    Official Sync, PWA behavior, or other user-visible functionality—requires
    an increment of that App's human-readable version under its own release
    governance. The build SHA remains secondary technical metadata, and the
    Official Data schema/version remains independent from the App frontend
    version.

Medical v1.1.8 with Medical GAS V17 is a verified reference implementation
of these semantics: it uses the approved Medical App Grant compatibility flow,
exposes a canonical revision through its read contracts, and has user-verified
Official Read, Official Write, Google Sheets synchronization, and persistence
after reopening Admin. It is evidence for the contract, not a drop-in source
template for unrelated Apps.

### Customer-facing technical status and Official Update UX

Normal customer Frontstage surfaces must not prominently expose implementation
language such as cache state, service-worker state, internal version checks,
storage details, deployment terminology, or debug diagnostics. Automatic
Official App Shell updates continue to operate under the [Automatic Official
App Shell Update Standard](#automatic-official-app-shell-update-standard); this
presentation rule never weakens or replaces automatic discovery, preparation,
activation, or safe fallback behavior.

AVA may present meaningful Official Update information through the existing
Update Notification architecture / Official Cloud configuration, including the
existing `update_notifications` source where applicable. It may communicate
the published version, title, concise summary, publication information, and
other customer-relevant change information. A second competing notification
source must not be created.

Official Update Notification and Device / Runtime Update State remain separate
sources of truth:

- **Official Update Notification** describes what AVA published and what
  changed.
- **Device / Runtime Update State** describes whether this device detected,
  prepared, activated, or failed to activate that version.

The device must not be labelled “Updated” solely because an Official
notification was published. Where practical, successful activation is based
on the version actually running on the device. If preparation requires the
current session to end, communicate the next step in customer language, such
as 「更新已準備完成，請完全關閉 AVA 後重新開啟。」. Do not expose Service
Worker, controller, cache, or similar implementation terminology to normal
customers. Developer diagnostics may remain available through appropriate
non-customer surfaces.

## 7. Local-First User Experience

Normal User operation is Local-first wherever appropriate. Once required Official data has been initialized and cached locally, interfaces open immediately from valid local data. Independent Apps must be capable of opening without downloading their complete Official dataset on every launch.

Cloud checking is efficient and does not unnecessarily block normal launch. Local-first behaviour is a performance and reliability principle, not permission to mix Official and User data.

After successful initialization, the launch experience is:

Open AVA → render from Local → lightweight central Official Version Manifest check → refresh only changed Official data when required.

The target experience is effectively instant opening from valid local data.

## 8. Centralized Platform Services

AVA Platform owns the Official Update Feed, Notification Center, and startup update checking. The existing authenticated AVA Studio / Official Cloud path publishes explicit records from the `update_notifications` source; Platform Users read active records while User-specific read, unread, and prompted state remains in the User/Local Layer. Independent Apps must not create duplicate AVA-wide notification centers or startup prompts. Independent Apps provide only integration metadata such as App ID, name, version, release information, and launch/module metadata where applicable.

Publishing or registering an Independent App makes it available; it must not overwrite an existing User Homepage's Area names, Folder structure, App placement, ordering, or User overrides. A new User may receive an Official Default placement where defined, but an existing User chooses whether to add an available App, its Area, optional Folder, and order.

Shared services are centralized at AVA Platform level where appropriate, including User Profile, User Settings, Backup, Restore, Device Transfer, common initialization, Official version checking, common authentication entry, and shared platform preferences. Independent Apps must not independently rebuild the same platform service without a genuine app-specific requirement.

Backup / Restore supports the AVA User Layer across the platform rather than requiring separate manual backup systems for each Independent App. Shared services preserve each App's data schema and domain ownership, and keep Official and User data separate.

### Central Official Version Manifest

AVA Platform should provide one lightweight Official Version Manifest containing independent versions for the Platform and relevant Independent App Official datasets. Conceptual entries include `platform_version`, `saving_version`, `medical_version`, `ci_version`, `claims_version`, `crm_version`, and `recruit_version`; these illustrate version ownership rather than prescribe a transport or storage schema. Each relevant Official dataset has its own version. One global Platform version must not control all App dataset versions.

AVA Platform may check this manifest centrally. If the relevant local Official-data version matches the manifest version, the full dataset must not be downloaded again merely because the App was opened. If a version changes, only the affected Official dataset requires refresh. Opening one Independent App must not force unrelated Independent Apps to reload their Official datasets.

Opening Saving must not cause Medical, CI, CRM, or unrelated App datasets to reload. Opening an Independent App should not require another full version check when AVA Platform already has a valid current manifest for the session. Central checking preserves instant opening, minimal network traffic, and precise Official updates.

Central version coordination preserves Independent App ownership of dataset schemas, content, calculations, and domain logic. A refresh updates the Local Official Cache without silently overwriting User Overrides.

### First Initialization

The intended first-use architecture is conceptually:

Scan QR → Install / Open AVA → First Initialization → obtain required Official baseline → establish Local Official Cache → User enters name → Save User Profile → enter AVA.

Initialization is a common platform experience. Independent Apps must not each create a duplicated full initialization experience unless a genuine app-specific requirement exists. Entering a profile name does not itself grant Admin authorization.

These are architectural principles; detailed PWA, cloud sync, GAS, Google Sheet, and caching implementations are outside this document's scope. The platform-wide Media, Portable Data, Backup / Restore, QR, and security requirements in Sections 12–14 are mandatory constraints for future implementations.

## 9. Independent App Data Ownership

Independent Apps remain responsible for their unique Business Logic, data and data schema, calculations, content, domain workflow, and app-specific functionality. Each App is the source of truth for its own domain semantics.

Centralization must not erase legitimate domain boundaries. Shared infrastructure belongs to AVA Platform; unique domain logic remains with the Independent App. Common design, administration, version coordination, and backup services do not transfer ownership of domain logic to the Platform or impose another App's calculations or workflow.

## 10. Responsive and Device-Independent Experience

AVA provides a coherent experience across phone, foldable phone, iPad portrait, iPad landscape, and larger screens. One common Design System governs responsive behaviour; each App must not independently improvise its own responsive architecture.

An unfolded foldable with a tablet-like viewport presents an appropriate tablet experience; narrower viewports adapt within the same architecture. Navigation, cards, typography, buttons, inputs, and modals remain usable. Content is not blocked, touch interaction remains practical, and layouts avoid unintended horizontal overflow while preserving domain workflows.

## 11. AVA Experience Principle

Easy for Agent → Natural Conversation → Instant Visualization → Easy for Customer

AVA reduces operational friction for the Agent and cognitive friction for the Customer. Customer-facing experiences should not feel like long questionnaires or system forms unless the business requirement genuinely requires one.

Prefer:

- Minimal necessary input.
- Natural conversational progression.
- Clear choices.
- Immediate visual feedback.
- Concrete numbers and concepts.
- Simple comparison.
- One-screen / one-concept presentation where appropriate.
- Fast transition from conversation to visualization.
- Customer-friendly presentation rather than backend-style data display.

Where appropriate, Apps support a presentation experience in which the Agent quickly transforms working information into a simple, clear customer-facing view. Presentation follows the common Design System while preserving the App's underlying domain meaning and calculations.

The objective is more than fewer clicks:

minimum friction → meaningful input → immediate useful result → clear customer understanding.

## 12. AVA Media Storage and Media Page Standard

AVA has one provider-independent Media Standard for every current and future Independent App. Media includes images, videos, and future large media assets. Media binary files must not be stored inside AVA application databases. In particular, an App must not store image or video binary in IndexedDB or LocalStorage, encode large Media as Base64 in an App database, or silently fall back to either store when Cloud Storage or file access fails.

User-added Media uses Cloud Storage. Mother Rules do not bind AVA to one provider; future formally supported providers may include Google Drive, OneDrive, Dropbox, or other supported providers. Provider support is extensible architecture, not a statement that every provider is currently implemented.

When a User adds a Flow Page containing Media, the User first chooses an Image Page or Video Page:

- An Image Page contains at most six images, supports multi-select / multi-upload, and uses a responsive grid. Desktop and tablet use at most three columns; one to six images auto-arrange by count, without a fixed empty 3×3 grid. Narrow and mobile viewports reduce columns as needed. Images preserve their original aspect ratio, are not stretched or distorted, do not create horizontal scrolling, and remain within the AVA Flow Canvas and Design System.
- A Video Page contains at most one video. It plays inside the AVA Flow Canvas using a responsive embedded player or supported Cloud playback mechanism, preserves the video aspect ratio, does not resize the App layout based on source dimensions, does not create horizontal scrolling, does not autoplay by default, and exposes normal playback controls.

An Independent App may decide whether Media Pages exist, their Flow position, title, subtitle, supporting text, visibility, ordering, and business context. Media storage, responsive behaviour, failure handling, and backup behaviour remain Mother Platform requirements.

The local AVA record for Media contains only the information required to render and reconnect it: media ID, provider type, Cloud file reference, metadata, Page relationship, display order, media type, and required rendering information. It must not contain large Media binary.

If a Cloud file is deleted, moved, inaccessible because of permission, unavailable because of provider failure, or blocked by expired authentication, the Flow must not crash. AVA shows a safe fallback such as 「媒體暫時無法使用」 / “Media temporarily unavailable”, provides an appropriate reconnect or re-authorize action where possible, and keeps other Pages and Flows usable.

## 13. User Portable Data and Cloud Backup / Restore

AVA Backup exists to reconstruct a User's AVA working environment on another device. Portable User Data includes, as applicable, User Settings, User and Flow Overrides, User-created Pages, Page Content, Page Order, Page Visibility, User-added content, Media metadata and references, Independent App user configuration, and any other User-local data designated portable by these Mother Rules. A restore must reproduce the User-defined environment, including the position and content of a custom Page between surrounding Pages, image order, Media references, visibility, and relevant User Overrides.

Portable User Data must never overwrite or contaminate Admin Official Defaults. The ownership model remains:

- **Admin Cloud = Official Defaults**
- **User Data = User-specific configuration and overrides**
- **Device Local Data = Local-first working copy**

User Override precedence and the Official Layer / User Layer separation in Sections 4, 5, and 6 continue to apply during export, backup, restore, refresh, and rendering. Restoring User Data does not publish it as Official data or grant Admin permission.

The platform Backup package contains portable User Data, relevant Independent App user data, and the schema / version information required for safe restore. It must not contain image binary, video binary, or other large Media binary. Original Media remains with the User-selected Cloud Provider, so a Media library of multiple gigabytes must not make the AVA Backup package multiple gigabytes.

Restore follows this conceptual sequence:

1. Obtain the User Backup.
2. Validate the Backup, schema, and version.
3. Rebuild Local-first User Data, Flow configuration, Pages, and Overrides.
4. Restore Media metadata and Cloud references.
5. Complete any required Cloud authentication / authorization.
6. Reconnect or retrieve Media as needed without requiring all Media to download at restore time.

Media should use lazy loading, on-demand loading, and streaming where appropriate. Backup / Restore remains a centralized Platform service while preserving each Independent App's schema and domain ownership; Apps must not create competing platform backup systems without a genuine app-specific requirement.

## 14. QR Restore, Security, and Implementation Compatibility

QR Code is a pointer, not storage. A QR Code must not contain a complete Backup package, image or video data, large User Data, permanent Cloud access tokens, refresh tokens, or other sensitive authentication secrets. It may contain only the minimum safe short data needed to locate a restore operation, such as a restore pointer, Backup identifier, secure restore reference, or equivalent.

The conceptual flow is **QR → locate Backup → authenticate / authorize User → restore User Data → reconnect Cloud Media → rebuild AVA environment**. QR size must not increase because the Backup references a 2 GB, 10 GB, or larger Media library. Scanning a QR Code alone must never expose the complete User Data; formal Provider / AVA security mechanisms must perform authentication and authorization. Credentials, access tokens, refresh tokens, and other secrets must not be written into an ordinary Backup payload or QR Code.

These standards preserve Local-first architecture. General structured AVA data may continue to use IndexedDB and LocalStorage where appropriate; IndexedDB is not prohibited. The explicit exception is:

**Large Media binary → Cloud Storage only**

Media metadata and references may follow normal AVA local-data architecture. Cloud failure must never cause a hidden large-binary fallback to IndexedDB or LocalStorage.

All Independent Apps—including Saving, Medical, Critical Illness, CRM, Recruit, and future Apps—must consume this common Media and Backup Standard. AVA Platform owns the shared Media architecture, storage rules, Backup / Restore rules, QR restore principles, responsive Media behaviour, security principles, and provider-independent interfaces. Independent Apps own their Media Pages, Page content, Flow position, presentation, and business context. Sharing the standard must not merge Independent App source code, repositories, Business Logic, calculations, data, or workflows into AVA Platform.

Any future implementation must account for iPhone / iOS, iPad / iPadOS, Android, HONOR Magic V5 folded and unfolded states, and AVA PWA / Home Screen mode. It must not assume identical File APIs, authentication behaviour, or Media playback capabilities across browsers, operating systems, or Cloud Providers. Unsupported capabilities require a graceful fallback and must not crash the App or silently store large Media binary locally.
