# 5Pay Module integration boundary

## AVA 1.3.1 registry and three entry modes

`5pay` remains one module and one business-logic implementation. AVA resolves the requested entry mode from its single module registry:

| AVA surface | Entry mode | Destination contract |
| --- | --- | --- |
| Home / favourites / tool library | `frontend` | `https://ivancww.github.io/5pay/` |
| 我的流程 → 5Pay | `user` | `?ava_platform=1&entry_mode=user&scope=user` |
| AVA Studio → 5Pay | `admin` | `?ava_platform=1&entry_mode=admin&scope=admin` |

`entry_mode` is the canonical AVA 1.3.1 contract. The existing `scope` parameter is retained for compatibility with the deployed 5Pay receiver. All entry points call `openModule(moduleId, entryMode)`, so management entries cannot silently fall through to the frontend destination. AVA does not embed 5Pay in an iframe and does not reproduce its mature editor as a generic JSON form.

## Feature-parity ownership matrix

The mature dashboards continue to be rendered and operated by 5Pay. AVA routes to them without copying or transforming their state.

### User dashboard (`entry_mode=user`)

* scenario switching and page-flow management;
* Zones A/B/C and the real Fixed Page A/B/C positions;
* Dynamic Questions: add, delete, move up/down, Question Type, Title, Subtitle, Options, Visual Steps and Button Text;
* Gap, compound-time, Jar and Blueprint settings;
* user-editable system settings;
* local save, Restore Team / Official Default, Import and Export;
* Personal Override isolation through `ava_user_has_customized`.

### Admin dashboard (`entry_mode=admin`)

* every flow and content-management capability available to the user dashboard;
* Official / Team Default management for every scenario and Fixed / Dynamic page;
* Mapping and System Parameters;
* GAS API, Google Sheet Sync and admin-only/password settings;
* `system_version` and Official Cloud Sync.

This matrix is a routing and ownership contract, not a second AVA implementation. Functional parity depends on the deployed 5Pay dashboard that receives these modes.

## LocalStorage compatibility

AVA does not rename or reinterpret 5Pay storage. Its backup adapter allow-lists and copies the existing values verbatim:

* `ava_user_has_customized`
* `ava_scenario_database`
* `ava_scenarios_db`
* `ava_jar_texts`
* `ava_blueprint_summary`
* `ava_blueprint_img`
* `ava_planner_display_name`
* `ava_strategy_by_term`
* `ava_jar_configs`

Restore writes only allow-listed keys. This keeps old browser data usable by 5Pay and prevents a backup payload from writing arbitrary LocalStorage entries.

## Ownership and sync audit

5Pay remains the sole owner of scenarios, questions, Zones A/B/C, fixed pages, Gap, compound-time, Jar, Blueprint, offer calculations, formulas, sheet mappings, `GAS_API_URL` and `system_version`. AVA does not introduce another content version or merge official cloud payloads into personal fields. Consequently `compareVersions()`, `incrementVersion()`, `syncAllToGoogleSheet()` and `fetchCloudDataWithFastCheck()` continue to run in 5Pay, including its `ava_user_has_customized` protection.

`AVA_PLATFORM_VERSION` is separately owned by AVA and represents the platform release only. The sidebar and system-settings displays read that single constant; it must never be used as 5Pay's data-sync `system_version`.

The platform repository does not contain the 5Pay application source. Cross-repository end-to-end verification of dashboard controls and cloud calls must be completed against the deployed 5Pay repository; this repository verifies the three distinct outbound entry contracts and preserves 5Pay data unchanged.
