# AVA Platform — Mother Rules

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
15. The applicable Automatic Update Gate passes: the latest deployment is automatically discoverable in browser and installed-PWA use, stale app-shell cache cannot indefinitely trap the old deployment, User Local Data survives update activation, no manual cache-busting is required, no reload loop exists, and the App updates independently of Platform and unrelated Apps.

The detailed Automatic Update Gate and status meanings are defined in [AVA Automatic Official App Update Standard](automatic-official-app-update.md).

Admin entry is required only when the App declares Admin capability. If `admin: true` is declared, `?avaEntry=admin` must pass live verification before Platform enables it. The normal sequence is **Independent App implementation → Independent App tests → Independent App review and merge → live deployment verification → Platform registration/update → Platform integration tests → Platform review and merge**.

Existing Apps are not retroactively declared compliant by this standard and must not lose working functionality solely because an audit is incomplete. They may require a later migration or audit against this contract. Future Customer-facing Apps must implement Front, User/Edit, Preview, Save Local, persistence, Return to AVA, responsive behavior, installed-PWA compatibility, and automatic Official app-shell update behaviour from initial implementation before Platform integration.

## 3. Single AVA Design System

There is only one AVA Design System. It is the Single Source of Truth for shared UI and UX presentation across AVA Platform, AVA Studio, and every Independent App, including:

- Typography, colors, spacing, and layout.
- Cards, buttons, inputs, navigation, and icons.
- Interaction states and shared visual components.
- Responsive behaviour and visualization presentation.
- Edit / Preview / Presentation modes.

Independent Apps must not create competing design systems. No Independent App is the design authority for another Independent App. An implementation reference does not become a UI standard.

Mother Rules establish this authority and the experience principles. Specific visual values, tokens, component implementations, and responsive specifications belong in the AVA Design System.

## 4. Frontstage-First Application Experience

Each Independent App's actual production Frontstage is its real working/customer-facing experience. Where user customization is required, the canonical User model is:

Frontstage → Edit → direct editing on the actual Frontstage → Preview → Save Local

**User = Frontstage + User Editing permission.** Where the owning module permits, the User may edit page text/content, add, delete, reorder/move, show/hide pages, modify local preferences, preview changes, save local overrides, or reset permitted local overrides. These edits belong to the User/Local Layer. Official Cloud, Google Sheet, and Admin-controlled data remain read-only to Users unless the owning module explicitly declares a field user-editable. Do not create a duplicated User Workspace merely to edit Frontstage content. Shared user settings belong to Platform services; app-specific editing remains directly on or close to the relevant Frontstage content/function.

## 5. AVA Studio Is the Official Admin Workspace

AVA Studio is the common administrative workspace and management pattern for Official AVA configuration and Official Cloud data. It manages and publishes Official Defaults and shared official configuration where appropriate. Admin is a separate administrative capability; do not replace AVA Studio with User Edit Mode. Independent Apps may own app-specific Admin functions—such as official App configuration, Google Sheet/GAS configuration, datasets, calculation parameters, mapping tables, cloud defaults, and publishing/synchronization controls—but these follow the AVA Studio management pattern and canonical Design System. The Independent App continues to own those functions and data; common management presentation and access conventions are defined by AVA Platform. Administrative functionality must not be unnecessarily duplicated inside each Independent App.

A person may simultaneously be an AVA User and an authorized Admin. User identity persists independently of Admin authorization. AVA Studio Admin authorization operates as a separate authenticated permission/session. Admin authentication grants administrative permission; entering AVA Studio must not replace, delete, or transform the person's User identity. Ending Admin authorization also preserves that User identity.

The reusable Platform contract for this separate authorization is defined in [AVA Studio Admin Authentication Contract](ava-studio-admin-authentication.md). `?avaEntry=admin` is routing/capability selection only; it is never authentication. Independent App Admin UI and Official-data writes require a Platform-authorized, App-bound grant verified by the App backend.

AVA Studio is Cloud-first for Official administrative data. An authorized Admin should be able to use AVA Studio from different authorized devices, including phone and iPad, and access the same current Official Cloud state. Official Admin changes are intended to synchronize across devices through the Official Cloud. Administrative access remains subject to authentication and permissions on each device.

## 6. Official Layer and User Layer Must Remain Separate

The Official Layer contains Official Defaults, official configuration, and centrally published data. A Local Official Cache represents Official data locally; it does not become User data merely because it is stored on a device.

The User Layer contains user-specific settings, edits, overrides, and local working data. Official Cloud updates must never silently overwrite User Overrides. When a User Override exists, the User Layer takes precedence for that user's rendered experience unless the user explicitly resets or removes the override.

Official publication and refresh update the Official Layer while preserving the User Layer. User customization does not implicitly publish or change Official Cloud data. This separation applies to rendering, initialization, refresh, backup, restore, and automatic app-shell update activation.

Automatic app-shell cache cleanup is never equivalent to User Data cleanup. The Automatic Official App Update Standard must preserve LocalStorage User Overrides, IndexedDB User data, User-created Pages, ordering, visibility, settings, backup references, Media references, and app-specific Local-first User data unless a separately designed and explicitly authorized migration requires otherwise.

## 7. Local-First User Experience

Normal User operation is Local-first wherever appropriate. Once required Official data has been initialized and cached locally, interfaces open immediately from valid local data. Independent Apps must be capable of opening without downloading their complete Official dataset on every launch.

Cloud checking is efficient and does not unnecessarily block normal launch. Local-first behaviour is a performance and reliability principle, not permission to mix Official and User data.

After successful initialization, the launch experience is:

Open AVA → render from Local → lightweight central Official Version Manifest check → refresh only changed Official data when required.

The target experience is effectively instant opening from valid local data.

Local-first dataset refresh and Official app-shell update are separate concerns. An app-shell update may replace deployable application assets but must preserve the User Layer and valid Local-first User data according to the [Automatic Official App Update Standard](automatic-official-app-update.md).

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

The Central Official Version Manifest coordinates Official dataset refresh. It does not own or couple deployed app-shell versions. AVA Platform and each Independent App independently own discovery and activation of their own newest deployed app shell under the [Automatic Official App Update Standard](automatic-official-app-update.md).

### First Initialization

The intended first-use architecture is conceptually:

Scan QR → Install / Open AVA → First Initialization → obtain required Official baseline → establish Local Official Cache → User enters name → Save User Profile → enter AVA.

Initialization is a common platform experience. Independent Apps must not each create a duplicated full initialization experience unless a genuine app-specific requirement exists. Entering a profile name does not itself grant Admin authorization.

These are architectural principles; detailed PWA, cloud sync, GAS, Google Sheet, and caching implementations are outside this document's scope. The platform-wide Media, Portable Data, Backup / Restore, QR, security, and Automatic Official App Update requirements are mandatory constraints for future implementations.

## 9. Independent App Data Ownership

Independent Apps remain responsible for their unique Business Logic, data and data schema, calculations, content, domain workflow, and app-specific functionality. Each App is the source of truth for its own domain semantics.

Centralization must not erase legitimate domain boundaries. Shared infrastructure belongs to AVA Platform; unique domain logic remains with the Independent App. Common design, administration, version coordination, backup services, and compliance standards do not transfer ownership of domain logic to the Platform or impose another App's calculations or workflow.

Deployment ownership also remains independent: AVA Platform owns its own deployment/update lifecycle, while each Independent App owns its own deployment/update lifecycle. A Platform app-shell release must not require unrelated Independent Apps to redeploy or change cache/version state, and an Independent App release must not require Platform or unrelated Apps to redeploy.

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

User Override precedence and the Official Layer / User Layer separation in Sections 4, 5, and 6 continue to apply during export, backup, restore, refresh, rendering, and automatic app-shell update activation. Restoring User Data does not publish it as Official data or grant Admin permission.

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

## 15. Automatic Official App Shell Update

AVA Platform and every AVA Independent App must support automatic discovery and safe activation of the newest Official deployed app shell in browser and installed PWA / standalone use.

The canonical requirements, prohibited failure modes, Local-first data protections, PWA activation behaviour, diagnostic identifiers, and readiness checks are defined in [AVA Automatic Official App Update Standard](automatic-official-app-update.md).

The required product outcome is:

Official deployment publishes a new version → User later opens or reopens that product → the product automatically discovers and loads its newest deployed app shell without manual cache clearing, site-data deletion, query-string cache busting, PWA reinstallation, repeated refresh, or manually supplied version identifiers.

AVA Platform owns its own deployment/update lifecycle. Each Independent App owns its own deployment/update lifecycle. App-shell versions must not be coupled across repositories. Automatic app-shell updates must preserve the User Layer and Local-first User Data, and Service Worker/app-shell cache cleanup must remain separate from User Data cleanup.
