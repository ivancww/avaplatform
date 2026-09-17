# Medsave module integration boundary

## Production source and versions

- Upstream repository: `ivancww/medsave`
- Audited production SHA: `9421e29884903f403596faba45f6d3e038972b41`
- Upstream production version: `v8.4.6`
- Integrated Medsave version: `v8.4.7`
- AVA Platform version: `v1.6.0`

The one vendored Medsave runtime remains the owner of its customer workflow,
Zone A/B/C schema, fixed pages, calculations, spreadsheet parsing, result
rendering, responsive rules and cloud payloads. Its precise upstream provenance
and checksum are recorded in `modules/medsave/UPSTREAM.md`.

## Explicit entry modes

| AVA surface | Mode | Destination |
| --- | --- | --- |
| Home / favourites / tool library | `frontend` | `modules/medsave/index.html?avaEntry=frontend` |
| 我的流程 | `user` | `modules/medsave/index.html?avaEntry=user` |
| AVA Studio → Apps / Modules | `admin` | `modules/medsave/index.html?avaEntry=admin` |

The mode is read before the customer shell is painted. Frontend mode disables
Medsave's internal management entries. User and Admin modes hide the customer
shell and present the production dashboard as a full workspace. User mode calls
the narrow `openAvaUserManagement()` wrapper, which establishes the User role
before invoking `openAdminDashboard()` and `applyRoleUI(false)`. Admin mode calls
the native `promptAdminLogin()` password gate. No text matching, synthetic click,
observer, iframe or replacement editor is used.

Closing User management returns to `avaSurface=user`; closing Admin management
returns to `avaSurface=admin`. With no supported `avaEntry`, Medsave retains its
standalone manifest, controls and modal-close behavior.

## Personal ownership and backup

Admin elevation no longer removes `ava_med_user_customized`. A full cloud fetch
continues to update shared version, password, theme and sheet mapping data, while
a customized user's scenario, timing/text, blueprint summary and system topic
remain local. The custom blueprint image was already local-only.

AVA's system settings remain the only integrated User backup surface. The
Medsave adapter copies these allow-listed strings verbatim:

- `ava_med_user_customized`
- `ava_med_scenario_db_v3`
- `ava_med_custom_timing`
- `ava_med_blueprint_summary`
- `ava_med_custom_blueprint_img`
- `ava_med_system_topic`

Restore forces the customization marker to `true` without importing a role.
Reset removes only the same personal keys. Password, version, mapping, role,
official theme, endpoints and runtime/calculation data are excluded.

## PWA ownership

Integrated modes do not attach Medsave's manifest and do not register its
service worker. AVA's root manifest and root service worker own the shared
`/avaplatform/` scope. Standalone Medsave retains its production manifest and SW
assets; its source still contains no active service-worker registration.
