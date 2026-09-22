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

AVA Studio is Cloud-first for Official administrative data. An authorized Admin should be able to use AVA Studio from different authorized devices, including phone and iPad, and access the same current Official Cloud state. Official Admin changes are intended to synchronize across devices through the Official Cloud. Administrative access remains subject to authentication and permissions on each device.

## 6. Official Layer and User Layer Must Remain Separate

The Official Layer contains Official Defaults, official configuration, and centrally published data. A Local Official Cache represents Official data locally; it does not become User data merely because it is stored on a device.

The User Layer contains user-specific settings, edits, overrides, and local working data. Official Cloud updates must never silently overwrite User Overrides. When a User Override exists, the User Layer takes precedence for that user's rendered experience unless the user explicitly resets or removes the override.

Official publication and refresh update the Official Layer while preserving the User Layer. User customization does not implicitly publish or change Official Cloud data. This separation applies to rendering, initialization, refresh, backup, and restore.

## 7. Local-First User Experience

Normal User operation is Local-first wherever appropriate. Once required Official data has been initialized and cached locally, interfaces open immediately from valid local data. Independent Apps must be capable of opening without downloading their complete Official dataset on every launch.

Cloud checking is efficient and does not unnecessarily block normal launch. Local-first behaviour is a performance and reliability principle, not permission to mix Official and User data.

After successful initialization, the launch experience is:

Open AVA → render from Local → lightweight central Official Version Manifest check → refresh only changed Official data when required.

The target experience is effectively instant opening from valid local data.

## 8. Centralized Platform Services

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

These are architectural principles; detailed QR, PWA, authentication, cloud sync, GAS, Google Sheet, and caching implementations are outside this document's scope.

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
