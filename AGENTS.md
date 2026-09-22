# AVA Platform — Agent Execution and Enforcement Rules

## 1. Authority and responsibility

This file governs how coding agents study, implement, validate and protect AVA standards. It is not a separate architecture or visual specification.

| Source | Authority |
| --- | --- |
| [AVA Mother Rules](docs/MOTHER-RULES.md) | WHAT the AVA ecosystem must be: architecture, product and experience principles, ownership boundaries |
| [AVA Design System](design-system/DESIGN-SYSTEM.md) and its canonical implementation | HOW shared AVA interfaces must look and behave: visual, component, interaction and responsive standards |
| Root AGENTS.md and applicable scoped AGENTS.md | HOW coding agents execute and enforce those standards |
| Target application's current code and app-specific documentation | Its unique Business Logic, calculations, Data, Content, domain workflow and functions |

For architecture and product decisions, enforce the Mother Rules. For shared presentation, enforce the Design System under those rules. Do not turn this file or scoped instructions into a competing source of architecture, tokens or component specifications. Historical implementation, migration notes and reference Apps do not override the canonical sources.

Respect explicit user scope, authorization and stopping points. A limited task is not permission to implement every target-state capability or remediate every historical inconsistency. If a necessary change requires a major product, data, security, permission or architecture decision not resolved by the task and canonical sources, identify the decision and obtain clarification before that dependent work.

## 2. Mandatory study order

For work on AVA Platform or any AVA Independent App, first determine the requested scope, target repository and affected surfaces. Before modifying files, read in this order:

1. The target repository's root AGENTS.md and any applicable scoped AGENTS.md.
2. The current AVA Mother Rules in `ivancww/avaplatform`.
3. The canonical AVA Design System specification and the implementation relevant to the task.
4. The target application's current Business Logic, Data, Content, calculations, domain workflows and app-specific functions relevant to the task.

When working in an Independent App repository, locate the authoritative Platform documents rather than assuming the relative links in this file exist there. If required sources cannot be accessed, report the limitation; do not substitute another App or invent the missing standard.

Another Independent App is never the architectural or visual authority. Study reference Apps only for genuinely relevant app-specific implementation understanding. Do not assume that Apps share routing, data schemas, calculations or workflows.

## 3. Platform and Independent App boundaries

Enforce Mother Rules 1, 2, 8 and 9: **AVA Platform = Mother Platform + Overall Work Platform**. Independent Apps remain independent functional modules with independent source code and repositories.

Before changing a capability, identify its owner. Shared platform-level architecture and services belong to AVA Platform. Each Independent App retains its unique Business Logic, calculations, app-specific Data and schema, Content, domain workflow and functionality.

Do not absorb, copy or rebuild an Independent App inside AVA Platform to achieve integration. Do not create competing platform architecture, Design Systems, module registries or preference systems. Use the applicable Platform registration, navigation, entry-point, Area / Preference and permission mechanisms defined by the canonical architecture.

For integration work, inspect actual routes and destinations before connecting them; never invent URLs. Verify applicable destinations, identity, return navigation, visibility and permissions. Enabling a module does not grant administrative permission. Preserve repository boundaries with separate source trees, diffs and any authorized branches, commits or PRs when multiple repositories require changes.

## 4. Shared UI and experience enforcement

Apply Mother Rules 3, 4, 5, 10 and 11 through the canonical Design System. All Platform interfaces and Independent Apps must use its shared UI patterns where applicable:

- Typography and font hierarchy.
- Colors, spacing and layout.
- Cards, buttons and inputs.
- Navigation and icons.
- Responsive behaviour and safe areas.
- Default, hover, pressed, focus, selected, disabled, loading, success, warning and error states.
- Use Mode, Edit Mode, Preview Mode and Customer Presentation Mode.
- Common visualization presentation for numbers, amounts, percentages, gaps, progress, comparisons and result/summary cards.

Use semantic Design Tokens and reusable components wherever an appropriate canonical pattern exists. Do not duplicate arbitrary visual values, copy another App's interface or establish a competing visual standard. Keep actual visual values and responsive thresholds in the Design System, not in AGENTS.md.

App-specific visualization is appropriate only when unique Business Logic genuinely requires it. Compose canonical primitives wherever possible and preserve the App's calculations, units, precision, data meaning and material qualifications.

Enforce the Frontstage-first approach: each Independent App's actual production Frontstage is its working/customer-facing experience. The canonical User model is **Frontstage + User Editing permission**: permitted edits happen directly on the Frontstage, followed by Preview and Save Local. Do not create a duplicated User Workspace merely to edit Frontstage content. User edits belong to the User/Local Layer; Official Cloud, Google Sheet and Admin-controlled values remain read-only unless the owning App explicitly declares them user-editable. User may add, delete, reorder, show/hide pages or change local preferences only where the App permits.

Admin is a separate capability and AVA Studio defines its common management pattern. Do not replace AVA Studio with User Edit Mode. Independent Apps may own app-specific official configuration, datasets, calculation parameters, mapping, cloud defaults and publishing/synchronization controls; use the AVA Studio pattern and canonical Design System while keeping that Business Logic and data under App ownership. Do not mandate three duplicated Frontstage, User and Admin workspaces inside every App.

Preserve User identity when administrative permission is granted or ended. User and authorized Admin may coexist for the same person. Visual modes, hidden controls and local profile fields do not grant administrative permission.

Enforce Mother Rule 11:

**Easy for Agent → Natural Conversation → Instant Visualization → Easy for Customer**

Reduce unnecessary questionnaire-style friction. Where appropriate, prefer minimal necessary input, clear choices, natural progression, immediate useful visualization and a simple customer-facing presentation. Never sacrifice required Business Logic, authoritative values, data correctness or material explanations to simplify the interface.

## 5. Responsive enforcement

Every applicable UI change must use the common AVA responsive system and consider:

- Phone.
- Foldable phone folded.
- Foldable phone unfolded.
- iPad portrait.
- iPad landscape.
- Larger screens.

Apply the Design System's viewport rules, including split-screen and changing foldable viewports. Do not create separate per-App or per-device responsive scales, Design Systems or business implementations.

Verify readable typography, usable navigation, touch targets, inputs, cards, wrapping, scrolling and modals within the usable viewport. Check horizontal and vertical safe areas, text scaling, keyboard focus, reduced motion, interaction states and both sides of shared responsive boundaries. Do not hide unintended overflow to disguise a layout problem.

## 6. Data and ownership protection

Before changing storage, rendering, refresh, backup or restore, identify and preserve the boundaries between Official / Platform data, User-owned data, app-specific data and temporary processing data. App-specific data may belong to either the Official or User Layer; temporary processing state must not be mistaken for either authoritative layer.

Enforce Mother Rule 6: a Local Official Cache remains Official data. Cloud/default updates must not silently overwrite User-owned data or User Overrides. Existing User Overrides take precedence for that user's rendered experience unless the user explicitly resets or removes them. User customization must not implicitly publish Official data.

Architecture integration or visual standardization must not change Independent App Business Logic, calculations, data meaning or schemas unless the task explicitly requires that change. Never estimate, fabricate or substitute business data when the App requires authoritative values. Preserve legitimate domain ownership when using shared infrastructure.

## 7. Central services and performance

For future implementation work, enforce the centralized services and Local-first direction in Mother Rules 7 and 8. Independent Apps should consume authoritative Platform services rather than unnecessarily rebuilding profile, settings, backup/restore, device transfer, common initialization, authentication entry or version-checking services. Do not require redundant per-App setup where Platform setup is authoritative; genuine app-specific requirements must remain within their domain boundary.

Normal User operation should render immediately from valid initialized local data where appropriate. Keep Platform/version checks and cache invalidation lightweight and avoid unnecessarily blocking launch. Unchanged authoritative dataset versions must permit reuse of valid local data rather than full downloads on every App opening.

When version coordination is in scope, follow the central lightweight Official Version Manifest principle: dataset versions remain independent, reuse a valid current session manifest, and refresh only affected Official data. Do not use one global Platform version to reload unrelated App datasets or overwrite User Overrides.

Keep Official administration Cloud-first through AVA Studio as prescribed by Mother Rule 5, with authenticated access to the current Official Cloud state across authorized devices. These enforcement rules do not themselves authorize QR, onboarding, cloud, caching, version-manifest or authentication implementation; implement only what the task requests.

## 8. Change discipline and production safety

For each task:

1. Study the applicable sources before modifying files.
2. Identify the exact requested scope, ownership boundaries and protected files or behaviour.
3. Make the smallest coherent change that satisfies the task.
4. Preserve unrelated Business Logic, calculations, Data, Content and functionality.
5. Avoid unrelated refactors, unnecessary rebuilds and schema changes.
6. Run validation appropriate to the changed scope.
7. Fix failures caused by the change within the authorized scope.
8. Re-test fixes and check relevant regressions.
9. Review the complete Git diff, including staged and unstaged changes and new files.
10. Report the result, actual validation, remaining issues and anything that could not be tested.

Resolve routine implementation and QA failures without repeatedly requesting confirmation. Respect explicit review-only or no-fix instructions. Escalate genuine unresolved major decisions rather than silently changing architecture, ownership or permissions.

Do not replace production code with samples, delete unrelated functionality, accidentally alter calculations during UI work, expose secrets or credentials, put sensitive User data into public URLs, or fabricate test results. Do not weaken access control or treat presentation-only hiding as security. Do not perform unauthorized production deployment to complete testing.

During diff review, check for accidental deletions, logic or data changes, placeholder/debug code, secrets, unrelated files, unnecessary binaries, unexpected generated artifacts and duplicated architecture. Investigate and explain large deletions; passing tests alone do not establish that a deletion is safe.

## 9. Validation and reporting

For Design System or shared UI changes, use [the canonical validation tool](design-system/validate.py) where applicable and follow the [Design System validation guidance](design-system/DESIGN-SYSTEM.md). Verify responsive behaviour, safe areas, interaction states and the absence of competing tokens/components. The isolated [reference/QA surface](design-system/preview.html) is not a production application or an Independent App compliance baseline.

For application changes, test the affected real application behaviour and relevant regressions within the task scope. For integration changes, test applicable entry paths, navigation, visibility, permissions and existing module behaviour. Keep domain tests separate from canonical Design System checks; neither substitutes for the other.

Use actual browser checks for applicable UI behaviour, prioritizing iPad portrait and landscape while covering the other required responsive classes. Use automation where available. If a browser is unavailable, check installed runtimes and equivalent capabilities and attempt to obtain a runtime when the environment and permissions permit. Report unresolved limitations honestly. CSS/code inspection is not an executed browser test, and desktop browser emulation is not physical iPad Safari certification.

Keep external-service, credential-dependent and deployment tests distinct from local/browser validation. Never claim full verification while required tests remain blocked or unexecuted.

| Status | Required meaning |
| --- | --- |
| PASS | The stated check or test was actually executed and passed; identify whether it was document/static review, browser automation or another method. |
| FAIL | The check was executed and an unresolved failure remains. |
| BLOCKED | A required check could not be executed because of an environment, runtime, credential, permission or service limitation; name the limitation. |
| NOT APPLICABLE | The check does not apply to the task or changed scope; explain why. |

Report skipped or unexecuted checks explicitly; never convert them into PASS. A completed implementation with pending required browser checks must be reported as code complete / browser QA pending, not fully verified. Report the actual engine, viewport/device coverage and test limitations without implying ecosystem-wide adoption from isolated fixture results.

## 10. Git workflow and stopping points

Follow the Git workflow explicitly requested by the user for the current task. This file does not require automatic staging, commits, pushes or PR creation after every change.

- If instructed to stop before PR, stop before PR.
- If instructed to create or update a PR without merging, stop after that PR work and report its link.
- Never merge unless explicitly instructed. Permission to modify, stage, commit, push or create a PR is not permission to merge.
- Preserve existing user changes and keep unrelated work out of the change set.

At the authorized stopping point, summarize changes, ownership/standard compliance, validation results, blocked or unexecuted checks, known issues, diff review and Git status. Include PR links only when PR work was authorized and performed. Do not turn a document-only or review task into application implementation, deployment or a release workflow.
