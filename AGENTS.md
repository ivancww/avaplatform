# AVA Platform — Master Agents Rules

## 1. AVA Platform Role

AVA Platform is the:

**Mother Standard + Overall Work Platform**

Repository:

`ivancww/avaplatform`

AVA Platform defines the common architecture, design, responsive behaviour, integration rules and working standards for the AVA ecosystem.

Existing Independent Apps include, but are not limited to:

* `ivancww/5pay`
* `ivancww/medsave`
* `ivancww/medicalclaims`
* `ivancww/CIApp`
* `ivancww/CRM`

Future AVA Apps must follow the same architecture.

AVA Platform is always the Mother Standard.

Other AVA Apps may be used as implementation references only.

No Independent App may replace AVA Platform as the Mother Standard.

---

## 2. Independent Module Architecture

Every AVA App must remain an:

**Independent App / Independent Module / Independent Repository**

AVA Platform must not absorb Independent App source code.

Do not:

* copy an Independent App into AVA Platform
* rebuild an Independent App inside AVA Platform
* merge Independent App Business Logic into AVA Platform
* duplicate an Independent App to achieve integration
* replace an existing production App with Sample / Demo code

AVA Platform is responsible for:

* Mother Standard
* Module Registration
* Platform Navigation
* Entry Points
* Permission / Visibility
* Area / Preference
* Integration
* Overall Work Platform

Independent Apps remain responsible for their own:

* Business Logic
* Data
* Calculations
* App-specific workflows
* App-specific functionality
* Independent source code
* Independent repository

---

## 3. Mother Standard

All AVA Independent Apps must follow the latest applicable AVA Platform Mother Standard.

This includes, where applicable:

* overall architecture
* User / Admin separation
* Design System
* typography hierarchy
* colours
* layout width / height behaviour
* spacing
* cards
* buttons
* inputs
* forms
* navigation
* responsive behaviour
* interaction patterns
* module integration patterns

The latest AVA Platform standard takes priority over historical standards from individual Apps.

Do not use 5pay, medsave, medicalclaims, CIApp, CRM or another Independent App as a replacement Mother Standard.

They may only be used as implementation references.

---

## 4. Incremental Modification Protection

When modifying an existing production App:

Modify the existing production code incrementally.

Do not:

* rebuild the App unnecessarily
* replace production code with Sample code
* delete existing functionality without explicit instruction
* change calculations without explicit requirement
* change Business Logic without explicit requirement
* change production data structures unnecessarily
* overwrite App-specific functionality simply to match another AVA App

Mother Standard alignment must not destroy the unique purpose or functionality of an Independent App.

---

## 5. AVA Development Lifecycle

AVA Independent Apps use a two-phase lifecycle.

### Phase 1 — Independent App Engineering

Phase 1 develops, upgrades or aligns the Independent App itself.

Typical workflow:

Study Target App
→ Study latest AVA Platform Mother Standard
→ Architecture Analysis
→ Product / Business Flow Analysis
→ Implementation
→ Code / Static Test
→ Functional Test
→ Fix
→ Retest
→ Regression Check
→ iPad Browser QA
→ Responsive Check
→ Git Diff Review
→ Pull Request
→ Merge

Phase 1 does not mean that the App has already been integrated into AVA Platform.

The Independent App remains independent after Phase 1.

---

## 6. Phase 1 Browser Acceptance Gate

The primary AVA Browser / Responsive Acceptance Standard is:

**iPad Browser**

iPad Browser is the main Browser Acceptance Gate for AVA Platform and AVA Independent Apps.

Phase 1 must prioritize actual usability and display correctness on iPad Browser.

Browser QA must verify, where applicable:

* App loads correctly
* Frontstage works correctly
* User Area works correctly
* Admin Area works correctly
* Navigation works correctly
* Main buttons work
* Inputs work
* Cards display correctly
* Modals work correctly
* Main Business Flow can be completed
* Browser console has no new blocking errors
* Typography follows Mother Standard
* Page width / height behave correctly
* Spacing behaves correctly
* Header / Navigation display correctly
* Scrolling works correctly
* no unintended horizontal overflow
* no blocked or hidden content
* no major component misalignment
* touch targets are suitable for tablet use
* no blocking visual regression

If a Browser issue is found:

Fix
→ Retest
→ Regression Check

Do not stop for user confirmation for ordinary implementation or QA fixes unless the issue requires a major Product, Data, Security, Permission or Architecture decision.

---

## 7. Browser Runtime Rule

If Playwright Chromium is not initially available:

1. Check whether Chromium, Chrome, Playwright or another usable Browser capability already exists.
2. If the environment permits installation, attempt to obtain the required Browser Runtime.
3. If Playwright Chromium cannot be used but another Browser Automation capability exists, use an equivalent method.
4. Only when no usable Browser Runtime can be obtained may Browser QA be marked:

   **BLOCKED — Browser Runtime Unavailable**

Only tests actually executed may be marked:

**PASS**

Never report an unexecuted test as passed.

Code inspection, CSS inspection or theoretical responsive correctness is not equivalent to an actual Browser Test.

---

## 8. Browser QA Status

Testing status must use clear categories:

**PASS**

Actually executed and passed.

**FAIL**

Actually executed and an unresolved issue remains.

**BLOCKED**

Could not be executed because of an environment, credential, external service or infrastructure limitation.

**NOT APPLICABLE**

The test does not apply to this App or change.

Do not treat BLOCKED or NOT RUN as PASS.

If Phase 1 code is complete but required iPad Browser QA cannot be executed, report:

**PHASE 1 — CODE COMPLETE / BROWSER QA PENDING**

Do not report:

**PHASE 1 — FULLY VERIFIED**

until the required Browser QA has actually passed.

---

## 9. Honor V5 / Foldable Compatibility

Honor V5 does not require a separate Design System, App implementation or Business Logic.

AVA uses one responsive architecture.

When Honor V5 is unfolded and provides a tablet-like viewport, the App should automatically present a layout comparable to the iPad / Tablet experience where technically appropriate.

When the viewport becomes narrower, the same responsive architecture must automatically adapt.

Minimum compatibility requirements:

* no unintended horizontal overflow
* no blocked content
* Navigation remains usable
* Cards adapt correctly
* Typography remains readable
* Buttons remain usable
* Inputs remain usable
* Modals remain inside the usable viewport
* Main Business Flow remains functional

Honor V5 is a Responsive Compatibility requirement.

It is not a separate primary Browser Acceptance Gate.

Physical Honor V5 device testing is not required for Phase completion unless explicitly requested.

---

## 10. External / Deployment Testing

Browser QA must be separated from External / Deployment testing.

Examples include:

* AI external service tests
* GAS tests
* Backend deployment
* Cloud Admin deployment
* credential-dependent services
* third-party APIs
* production services

If such testing cannot be completed because required credentials, permissions, services or deployment environments are unavailable, mark it:

**BLOCKED**

Do not claim it passed.

Do not perform unauthorized Production Deployment merely to complete QA.

---

## 11. Phase 1 Completion

Phase 1 may be considered Fully Verified when required tests are completed, including at minimum where applicable:

Code / Static Test = PASS

Regression Check = PASS

iPad Browser QA = PASS

Additional App-specific tests may also be required.

After Phase 1:

Create the required Pull Request.

Do not automatically Merge unless the user has explicitly authorized automatic merging for that task.

When the workflow specifies that the user performs the final Merge:

Create PR → Stop → Report → User decides Merge

---

## 12. Phase 2 — AVA Platform Integration

Phase 2 begins only after the relevant Phase 1 work has been completed and merged.

Phase 2 formally integrates the Independent App into AVA Platform.

The purpose is:

Make the Independent Module usable through AVA Platform without merging its source code into AVA Platform.

Phase 2 must preserve:

AVA Platform = Mother Standard + Overall Work Platform

Target App = Independent Module

AVA Platform handles:

* Module Registration
* Entry Points
* Navigation
* Permission
* Visibility
* Area / Preference
* Integration

Target App retains:

* Business Logic
* Data
* Calculations
* App-specific functionality
* Independent repository

---

## 13. Three Independent Entry Points

Every integrated AVA Module must support three distinct contexts in AVA Platform:

### Frontstage

The normal operational / presentation / client-facing App experience.

### User

The Module’s User-level settings, personal configuration, local data or user-customizable functionality.

### Admin

The Module’s administrative controls, cloud-controlled settings, system parameters, templates, version controls or other Admin functionality.

AVA Platform must present these contexts independently.

Do not create only one generic Module entry and require the user to enter the App first and manually switch between:

Frontstage

User

Admin

AVA Platform should know which context the user selected and direct the user to the appropriate destination.

Before implementing the three entries:

Study the Target App’s existing routing, URL structure and architecture.

Do not invent URLs.

If an entry does not yet exist, determine the minimum necessary incremental change required to support correct integration.

---

## 14. Area / Preference Registration

Every Module integrated during Phase 2 must be correctly registered in AVA Platform’s existing Area / Preference architecture.

Where applicable, registration must include:

* Module Name
* Module ID
* Icon
* Category / Area
* Frontstage Entry
* User Entry
* Admin Entry
* Display / Hide
* Ordering / Position
* Role Visibility
* Responsive behaviour

Use AVA Platform’s existing Module Registration and Preference architecture.

Do not create a parallel integration system for one Independent App if AVA Platform already provides the required architecture.

---

## 15. Permission / Visibility

Frontstage, User and Admin visibility must be treated independently.

Do not assume that because a Module is enabled, all three contexts must automatically be visible to every user.

AVA Platform must respect the existing applicable:

* role
* permission
* visibility
* preference
* area configuration

Do not weaken existing access control simply to make Module integration easier.

---

## 16. Phase 2 Modification Protection

Phase 2 is an Integration Phase.

It must not become an excuse to rebuild the Independent App.

Do not:

* rebuild Target App
* merge Target App source into AVA Platform
* replace Target App with Sample code
* remove Phase 1 functionality
* change Business Logic unnecessarily
* change calculations unnecessarily
* change production data unnecessarily
* overwrite unique App behaviour based on another Reference App

If the Independent App requires modification solely to support Phase 2:

Use the minimum necessary incremental modification.

---

## 17. Phase 2 Workflow

Phase 2 should normally follow:

Study Phase 1 final state
→ Study latest AVA Platform
→ Identify existing Module Integration Architecture
→ Architecture Analysis
→ Integration Plan
→ Implement Integration
→ Register Module
→ Connect Frontstage Entry
→ Connect User Entry
→ Connect Admin Entry
→ Configure Area / Preference
→ Permission / Visibility Check
→ iPad Browser Integration QA
→ Responsive Compatibility Check
→ Integration Test
→ Fix
→ Retest
→ Regression Check
→ Git Diff Review
→ Pull Request

Ordinary implementation issues should be resolved automatically.

If testing reveals a normal bug:

Fix
→ Retest
→ Continue

Only stop for user input when a decision genuinely requires the user, including major:

* Product decisions
* Data decisions
* Security decisions
* Permission decisions
* AIA-specific policy / rule decisions
* major Architecture decisions

---

## 18. Phase 2 iPad Integration Gate

After Module Integration, iPad Browser QA must verify the integration path.

At minimum:

AVA Platform
→ Frontstage Entry
→ Independent App Frontstage

AVA Platform
→ User Entry
→ Independent App User Area

AVA Platform
→ Admin Entry
→ Independent App Admin Area

AVA Platform
→ Area / Preference
→ Module visibility / configuration

Also verify:

* correct Module identity
* correct Navigation
* correct target URLs / routes
* no blocking console errors introduced by integration
* no broken return/navigation behaviour
* no major iPad layout regression
* existing AVA Platform Modules remain functional
* Target App Phase 1 functionality remains functional

Phase 2 is not Fully Verified until required Integration Browser QA has actually passed.

---

## 19. Multi-Repository Changes

If Phase 2 requires changes to both:

`ivancww/avaplatform`

and

the Target Independent App repository,

keep the repositories separate.

Use separate:

* source trees
* branches
* commits
* Git diffs
* Pull Requests

Do not combine two independent repositories into one codebase merely for convenience.

Clearly explain why each repository required modification.

---

## 20. Regression Protection

Every Phase must protect existing production behaviour.

Regression checks should confirm that the change has not unintentionally broken:

* existing Business Logic
* calculations
* data behaviour
* Frontstage
* User Area
* Admin Area
* Navigation
* responsive behaviour
* existing AVA Platform Modules
* existing Target App functionality

A visual redesign must not silently alter functional logic.

An integration change must not silently alter App calculations or data.

---

## 21. Git Diff Review

Before creating a Pull Request:

Review the complete Git Diff.

Check for:

* accidental deletion
* unintended Business Logic changes
* unintended calculation changes
* Sample / Placeholder code
* Debug code
* secrets
* credentials
* unnecessary binary files
* unrelated changes
* duplicated architecture
* unexpected generated files

Large deletion counts must be investigated and explained.

Do not assume a large deletion is safe simply because tests pass.

---

## 22. Pull Request Rule

After implementation, testing and Git Diff Review:

Create the appropriate Pull Request(s).

Provide:

1. Phase summary
2. Architecture changes
3. AVA Platform changes
4. Target App changes, if any
5. reason for Target App changes
6. Frontstage Entry
7. User Entry
8. Admin Entry
9. Area / Preference integration result
10. actual tests executed
11. test results
12. tests not executed
13. BLOCKED items
14. Regression Check result
15. known issues
16. Pull Request link(s)

Never claim an unexecuted test was completed.

When final Merge belongs to the user:

Stop after creating the Pull Request.

Do not Merge.

---

## 23. Agent Working Behaviour

When an AVA development task is assigned:

Study before modifying.

Do not assume another Independent App has identical architecture.

Use AVA Platform as Mother Standard.

Use other AVA Apps only as implementation references.

Preserve the Target App’s unique Business Logic.

Prefer incremental production-safe changes.

Do not repeatedly stop for routine implementation decisions.

Continue through:

Implementation
→ Test
→ Fix
→ Retest
→ Regression
→ QA
→ Diff Review
→ PR

unless a genuine user decision is required.

---

## 24. Source of Truth

For AVA ecosystem architecture and common standards:

AVA Platform is the source of truth.

For an Independent App’s unique Business Logic, calculations and App-specific data:

That Independent App is the source of truth.

The Agent must respect both boundaries.

Mother Standard controls common architecture and experience.

Independent Module controls its unique functional logic.

---

## 25. Core Architecture Summary

The permanent AVA architecture is:

AVA Platform

Mother Standard + Overall Work Platform

↓

Independent Modules

5pay

medsave

medicalclaims

CIApp

CRM

and future AVA Apps

↓

Development Lifecycle

Phase 1

Independent App Engineering + iPad Browser QA

↓

PR / Merge

↓

Phase 2

AVA Platform Module Integration

↓

Frontstage + User + Admin

↓

Area / Preference + Permission / Visibility

↓

iPad Browser Integration QA

↓

Regression Check

↓

PR

↓

Final Merge decision
