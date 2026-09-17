# CIApp Phase 2 integration boundary

## Independent module ownership

CI Protection remains the independently deployed `ivancww/CIApp` application. AVA Platform
registers navigation metadata and three explicit entry contexts only. It does not copy, embed,
rebuild, cache or take ownership of CIApp source code, calculations, workflows, Firebase/GAS data,
private IndexedDB files or business logic.

The integrated Phase 1 baseline is CIApp v9.12.0, merged to CIApp `main` by PR #7.

## Registered entries

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `../CIApp/?mode=frontend` |
| 我的流程 | User | `../CIApp/?mode=user` |
| AVA Studio → Apps / Modules | Admin | `../CIApp/?mode=admin` |

`mode=user` opens CIApp personal settings, cases and documents. `mode=admin` opens the same
independent application and retains its existing password gate before official cloud controls are
available. AVA does not pass credentials or grant Admin authority.

## Registry, area and preferences

- Module ID: `ci-protection`
- Module name: `CI Protection`
- Icon: existing AVA `heart`
- Category / area: `protection`
- Enabled and visible: yes
- Eligible for favourites: yes
- User settings and Admin settings: both registered
- Position: existing CI Protection registry position, after Medical Claims

These values use AVA Platform's existing `MODULE_REGISTRY`; no CI-specific registry, preference or
permission system is introduced. Existing responsive cards, tool library, My Flows and AVA Studio
rendering therefore apply automatically.

## Storage and backup boundary

CIApp personal data remains under CIApp ownership. Because the independent deployment has its own
browser storage scope and runtime, AVA Platform does not serialize CIApp IndexedDB files or attempt
cross-application storage access. CIApp's Phase 1 rule remains authoritative: User private uploads
use the user-owned IndexedDB provider, while authenticated Admin official uploads retain the legacy
Firebase/GAS path. Existing CIApp data is not migrated or deleted by this integration.
