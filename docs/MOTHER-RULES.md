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

## 16. Independent App Admin Integration Security Standard

Every Independent App that declares an AVA Studio Admin capability MUST implement the canonical `ava-admin-session-v1` contract before Platform registration enables that capability. The contract is shared security infrastructure, not an App-specific password flow.

The required sequence is one AVA Studio password login, a valid Platform Admin session, an App-scoped one-time launch ticket and nonce, a retained-opener browser handshake, a Platform-minted browser-bound proof, and a server-side App-to-Platform exchange. The App backend MUST validate origin, App ID, ticket/nonce binding, expiry, one-time consumption, replay rejection, and the active Platform session before issuing or accepting an App Admin session. Returning to AVA is navigation only and never grants permission.

Copied Admin URLs, query strings, referrers, UI visibility, LocalStorage, frontend flags, or an `avaEntry=admin` value MUST NOT independently grant Admin access. Admin passwords, Platform session tokens, signing keys, and Script Properties MUST remain outside frontend code, URLs, User data, backups, QR codes, and browser-persistent User storage. No App may add a second password login or downgrade to an anonymous or URL-authorized Admin route.

Every Official read or write MUST remain behind the App's server-side authorization boundary. Official writes additionally require App business validation and verification of the signed Platform Admin Session Proof for the correct App ID and operation.

## 17. Independent App GAS Completeness and Deployment Standard

A GAS integration fragment is not a production project. Before an App is reported integrated, inspect the entire production Apps Script project and verify that it has exactly one effective `doGet` and one effective `doPost`, correct POST action routing, all referenced functions, the required Script Properties, the correct Platform endpoint, the correct App ID, and the complete request/response contract.

Never replace a complete production GAS project with a partial repository fragment. Preserve existing read and write behavior, Google Sheets, Official Data, deployment URLs, and App-owned business logic. Production equivalence is established only by inspecting the deployed version selected by the existing production deployment, not by inspecting source editor code alone.

## 18. Independent App Integration Verification Gates

Each participating App MUST record the following gates independently as `PASS`, `FAIL`, `BLOCKED`, or `NOT TESTED`: (1) GitHub source/deployment equivalence; (2) GAS GET/POST routing; (3) Platform Admin contract compatibility; (4) authorized server-side Admin exchange; (5) Official Read authorization; (6) browser-bound Admin launch and return; (7) security negative tests; and (8) production deployment verification.

Negative tests MUST reject missing or expired tickets, invalid App IDs, invalid or missing nonce, missing browser proof, replayed tickets, copied Admin URLs, and unauthorized Official writes. Browser redirect or Cloud Browser limitations MUST be reported as a browser/infrastructure `BLOCKED` result and MUST NOT be misclassified as an App authorization failure. A server-side diagnostic MUST NOT be described as complete browser E2E.

An App is not fully Integration Ready while an applicable gate is `FAIL` or `BLOCKED`. Permanent rules belong here; temporary incident evidence belongs in the verification record or release notes.
