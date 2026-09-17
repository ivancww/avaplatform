# Medical Claims production module integration

## Baseline

- AVA Platform: `b5c9c8f6c3cac3e9f4bc95e25c95c33e0ddb7dd3`, v1.6.0.
- Medical Claims: `3c7a71a0b66702d4bb773eb8bee744610c5aa570`, v7.5.1.

## Runtime and entries

A single runtime at `modules/medicalclaims/index.html` accepts explicit modes:

- `?avaEntry=frontend` — customer Medical Claims flow.
- `?avaEntry=user` — existing personal Tailor-made, case, document and display management.
- `?avaEntry=admin` — the same mature management runtime with its original password gate and official/cloud controls.

Integrated close navigation returns frontend to the AVA workspace, user management to My Flows,
and admin management to AVA Studio. Without `avaEntry`, the copied runtime retains standalone mode
and registers its module service worker; integrated entries never register it.

## Storage ownership

| Classification | Stores / keys | AVA backup |
| --- | --- | --- |
| Personal Agent Configuration | `AVA_MED_APP_TAILOR_V1`, hidden cloud case IDs, case overrides, local user cases, hidden cloud document IDs, local document metadata and document order | Allow-listed |
| Personal document payloads | IndexedDB `AVA_MED_USER_DOCUMENTS_V1` / `userFiles` | Not serialized by the current synchronous JSON package; metadata is retained |
| Official/System Configuration | `AVA_MED_APP_DB_CACHE_V7`, cloud `config`, premium tables, plan items and official claim cases | Excluded |
| Cache / cloud reference data | `AVA_MED_APP_DB_CACHE_V7`, GAS responses and Firebase-hosted files | Excluded |
| Runtime / temporary | in-memory `appState`, answers, computed claims/results and open-tab state | Excluded |
| Admin/Auth | password in official config, URL login parameter and in-memory `isAdminMaster` | Excluded |
| Infrastructure | GAS URL and Firebase configuration | Excluded |

Restore is constrained to the exact personal-key allow-list, so it cannot overwrite official data,
cloud precedence, infrastructure settings or authorization state.

## PWA ownership

AVA's root service worker caches the integrated runtime and owns `/avaplatform/`. Medical Claims'
module service worker is never registered for any explicit AVA entry. Its standalone worker is
retained for no-entry deployments and now limits cleanup to `ava-medical-cache-*`; it cannot delete
AVA caches. The root worker likewise only deletes `ava-platform-*` caches.

## Hard-protection statement

The upstream Medical Claims calculation engine (`script.js`) is copied without modification.
No claim formula, business rule, data meaning, workflow/result meaning, Wise/Flexi rule, SMM formula
or cap was changed. Integration changes are limited to presentation, entry routing, backup ownership,
PWA ownership and independent version metadata.

## Storage/privacy revision

The AVA Platform storage provider registry and detailed official/personal ownership contract are
documented in `docs/medicalclaims-storage-privacy.md`. Medical Claims consumes that interface;
personal uploads no longer depend directly on its legacy IndexedDB and never use the admin Firebase
upload path. AVA v1.8.0 and Medical Claims v7.7.0 contain this production revision.
