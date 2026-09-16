# 5Pay Module integration boundary

## AVA 1.3 registry and routing

`5pay` is the first module with explicit runtime, personal-settings and official-settings capabilities in AVA's single module registry. The homepage and tool library open the normal 5Pay frontend. **我的流程 → 5Pay** resolves the personal-settings target and **AVA Studio → Apps / Modules → 5Pay** resolves the official-settings target. Other cards no longer fall through to a 5Pay editor; AVA reports that their management interface has not been migrated.

The query contract passed to 5Pay is:

* runtime: `https://ivancww.github.io/5pay/`
* personal: `?ava_platform=1&scope=user`
* official: `?ava_platform=1&scope=admin`

AVA does not embed 5Pay in an iframe and does not reproduce its mature editor as a generic JSON form. The previous generic AVA JSON editor is removed.

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

5Pay remains the sole owner of scenarios, questions, Zones A/B/C, fixed pages, Gap, compound-time, Jar, Blueprint, offer calculations, formulas, sheet mappings, GAS URL and `system_version`. AVA does not introduce another content version or merge official cloud payloads into personal fields. Consequently `currentSystemVersion`, `compareVersions()`, `incrementVersion()`, `syncAllToGoogleSheet()` and `fetchCloudDataWithFastCheck()` continue to run in 5Pay, including its `ava_user_has_customized` protection.

The platform repository does not contain the 5Pay application source. Cross-repository verification of those functions and the `ava_platform` query handling must therefore be completed in the 5Pay repository; AVA 1.3 supplies the routing contract and preserves its data unchanged, but does not claim that unavailable source as vendored code.
