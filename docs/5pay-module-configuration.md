# 5Pay Module integration boundary

## Source and version

AVA Platform `ce483eb19cf744d1d9bd03cc17e5cd277cff60b5` and 5Pay
`f20e2df1ede891a5afa0601b0a3ffd2ea44ec0e4` were the integration baselines.
The imported production runtime is 5Pay `v6.3.23`; its exact provenance and
upstream checksum are recorded beside the runtime in `modules/5pay/UPSTREAM.md`.
AVA Platform is version `v1.4.1`, independently of 5Pay's `system_version`.

## One runtime, three explicit entry modes

All entry points use the same local production runtime and therefore the same
origin and LocalStorage as AVA:

| AVA surface | Entry mode | Destination |
| --- | --- | --- |
| Home / favourites / tool library | `frontend` | `modules/5pay/index.html?avaEntry=frontend` |
| 我的流程 → 5Pay | `user` | `modules/5pay/index.html?avaEntry=user` |
| AVA Studio → Apps / Modules → 5Pay | `admin` | `modules/5pay/index.html?avaEntry=admin` |

The AVA frontend path hides the two dashboard entry controls while leaving the
standalone path (with no `avaEntry`) unchanged. The two management paths are
read as an explicit runtime contract before paint. They hide the customer shell,
present the existing dashboard as a full workspace, and invoke the production
function `openDashboardWithRole('user' | 'admin')`. Admin mode therefore
continues through 5Pay's native password prompt and role switch. Closing user
mode returns to AVA's 「我的流程」 directory; closing admin mode returns to
「AVA Studio · Apps / Modules」. The customer frontend is not a management
mode return destination.
There is no DOM text search, MutationObserver, synthetic click, generic editor,
or fallback dashboard.

The former bridge failed because it fetched `/5pay/`, injected a second script,
and guessed controls from visible translated text. Routing depended on markup,
timing and deployment layout rather than a contract, while the actual runtime
never received a supported entry mode. That bridge and loader have been removed.

## Frontend protection and dashboard ownership

Except for the explicit startup hook, the production frontend, workflows,
calculations, data, responsive rules, cloud fetch and result rendering are
unchanged. A regression test reverses the reviewed integration deltas and
requires the result to match the upstream SHA-256 byte-for-byte.

5Pay remains the only owner of both dashboards. User mode retains scenario and
page-flow editing, Zones A/B/C, fixed-page positioning, questions/options,
visual steps, Gap, compound-time/Jar, Blueprint, planner settings and local
personal save. Only the duplicate user-facing Restore Team Default, Import and
Export buttons were removed; their underlying functions remain for dependency
compatibility. Admin mode retains Mapping, GAS URL, password, Google Sheet Sync,
official publishing and `system_version` controls.

## Unified AVA backup / restore / reset

The existing AVA system-settings UI remains the sole data-management surface.
Its package orchestrator exports/restores platform settings and every registered
module adapter in one operation. The 5Pay adapter copies allow-listed values
verbatim and does not rename, parse, merge or reinterpret them. Platform reset
now invokes each registered adapter's reset hook, so one AVA reset clears the
platform preferences and 5Pay personal override keys; the next 5Pay load uses
its unchanged official cloud/default behavior. No per-module backup UI or second
backup format was introduced.

## Protected 5Pay contracts

5Pay still owns `GAS_API_URL`, `currentSystemVersion`, `compareVersions()`,
`incrementVersion()`, `applyVersionToUI()`, `syncAllToGoogleSheet()` and
`fetchCloudDataWithFastCheck()`. Customized users retain their local personal
content while cloud fetch can still update shared `system_version` and
`sheet_mappings`. AVA's version is not passed to, or used by, those functions.
