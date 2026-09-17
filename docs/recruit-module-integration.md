# AVA Recruit Phase 2 integration boundary

## Independent module ownership

AVA Recruit remains the independently deployed `ivancww/recruit` application. AVA Platform
registers navigation metadata and three explicit entry contexts only. It does not copy, embed,
rebuild or cache Recruit source code, recruitment content, candidate sessions, calculations,
forecast logic or business rules.

The integrated Phase 1 baseline is AVA Recruit v2.0.0, merged to Recruit `main` by PR #1.

## Registered entries

| AVA surface | Context | Destination |
| --- | --- | --- |
| Home / favourites / tool library / GROW navigation | Frontstage | `https://ivancww.github.io/recruit/index.html?avaEntry=frontend` |
| 我的流程 | User | `https://ivancww.github.io/recruit/index.html?avaEntry=user` |
| AVA Studio → Apps / Modules | Admin | `https://ivancww.github.io/recruit/index.html?avaEntry=admin` |

Recruit reads `avaEntry` without altering standalone behaviour. Frontstage opens the guided Career
Discovery flow. User opens the personal settings and local session surface. Admin opens the existing
Admin access surface and retains Recruit's own access gate; AVA Platform does not pass credentials or
grant Admin authority. Every integrated context shows a return control to the matching AVA surface.

## Area, preference and visibility

- Module ID: `recruit`
- Module name: `AVA Recruit · Career Discovery`
- Icon: existing AVA `user-plus`
- Category: `recruitment`
- Area: `grow`
- Order: `50`
- Enabled and visible by default
- Eligible for favourites
- Frontstage, User and Admin role visibility enabled
- User and Admin settings capabilities enabled

The module uses the existing `MODULE_REGISTRY`, favourites, tool library, My Flows and AVA Studio
rendering. No Recruit-specific parallel registry, permission system or navigation architecture is
introduced.

## Storage and PWA boundary

Recruit candidate sessions, personal preferences and Admin preview data stay under the independent
Recruit origin and storage keys. AVA Platform does not read or serialize those records. AVA Platform's
service worker continues to own only `/avaplatform/` and does not cache the external Recruit runtime.
