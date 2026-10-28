# Workspace UX and existing Sheet registry — v1.15.0 review

Verdict: **HOLD for production release**. The final safety repair is ready for product-owner source review once the exact-HEAD CI gates below pass. All 41 Node test files pass with zero failures/skips; the three historical failures are resolved. Fresh GAS property verification, physical-device acceptance and live post-migration validation remain outstanding. Do not merge or deploy from this report.

## Final revision and evidence

- Final PR #75 HEAD: `{{FINAL_PR_HEAD}}`; base `main`: `d1b17562b987337c322adaf94d2e6e6f5570bccf`.
- Final-HEAD CI: [release, full Node suite, Workspace browser QA and canonical Design System]({{FINAL_CI_RUN}}).
- This source report uses CI substitutions because a committed file cannot contain its own commit hash. The workflow checks out the explicit PR HEAD, asserts its identity and clean tracked source, joins Node/browser/design results for that same SHA, and uploads `workspace-final-review-<HEAD>` containing this report rendered with the exact SHA/run and `workspace-final-evidence.json`. The PR description records the literal final SHA. Unrendered placeholders are not evidence of a passing run.
- Review began from PR HEAD `699a6e0d6b961c0c854dae415ec23cf8fb16df56`; both it and latest main reproduced the same three historical failures before repair. Main had 37 files (34 pass/3 fail), PR had 41 (38 pass/3 fail), with no skipped files.

## Verified baseline and ownership

- Latest `main` fetched before implementation: `d1b17562b987337c322adaf94d2e6e6f5570bccf` (PR #73 merge).
- Only `ivancww/avaplatform` is changed. Independent App repositories, their GAS, Sheets, Firebase, product logic and deployments are untouched.
- Existing Sheet: [AVA-Platform](https://docs.google.com/spreadsheets/d/1-p_DCV5RDI9AzN3ZiVPlsCJXx47vMYJ96bT8LTawKvk/edit).
- Its identity was discovered with Drive and **independently verified from the Apps Script project overview's container link**, rather than inferred from its name.
- Bound script: `1_2CJUnrvJjURye0-4mJsZPRHndVst-zm_koUHYCjUntfe9hrs2A2H9Nm`.
- Prior read-only inspection in this task thread (before the final safety pass): deployment management showed active **version 6**, description `Browser-bound Admin security repair (Platform PR #57)`, executing as owner, existing access policy “Everyone”. Endpoint matches `AVAHomepageCloud.ENDPOINT` exactly:
  `https://script.google.com/macros/s/AKfycbzVf1fuxcq8GPSOzS8WvcAtubqaawFj0rbVjxe0LOLKfwbYkRZf7Vs61Q0T73UG6dznww/exec`.
- In that prior inspection, complete editor source and the deployed version-6 source were read through the UI and compared: identical, 17,447 characters excluding the repository's final newline, one effective `doGet`, one effective `doPost`. No changes were made in Apps Script.
- Script Properties references remain `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `AVA_ADMIN_APP_IDS` plus existing session/ticket/grant/proof keys. No credential is committed or delivered to the frontend. The UI only lists the first 50 properties; this is not an exhaustive property audit.
- Previously observed `AVA_ADMIN_APP_IDS`: `critical-illness, medical, 5pay, medicalreserve, crm, retire`. **EverBliss is already absent from this server allowlist despite its frontend Admin capability**. Existing authorization is preserved. On the final safety pass the browser was unsigned and redirected from the bound editor to the Apps Script public site, so a fresh properties/deployment read is **BLOCKED / NOT VERIFIED**. This report does not assert that the current allowlist is unchanged. Live Admin access cannot be declared passing; any repair needs separate explicit approval. See the security decision below.
- Browser/PWA storage on users' installed devices is not accessible in this workspace. Actual per-user overrides could not be inventoried. Existing schema/precedence, legacy folders, personal cards, local order and known override fields are covered by regression fixtures; this is not a snapshot of every user's device.

## Exact existing App inventory: before = after

The full JSON snapshot, including descriptions, flags, all entry modes and integration metadata, is in `tests/fixtures/workspace-baseline.json`; `workspace-registry.test.js` compares every property. No existing source registration was added, removed, renamed, duplicated or re-keyed.

| Immutable ID / moduleId / module_key | Canonical deployment | Front route | User route | Admin route | Official order |
| --- | --- | --- | --- | --- | ---: |
| `5pay` | `https://ivancww.github.io/5pay-saving-plan/` | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=frontend` | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=user` | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=admin` | 50 |
| `medical` | `https://ivancww.github.io/medical/` | `https://ivancww.github.io/medical/?avaEntry=frontend` | `https://ivancww.github.io/medical/?avaEntry=user` | `https://ivancww.github.io/medical/?avaEntry=admin` | 60 |
| `critical-illness` | `https://ivancww.github.io/critical-illness-/` | `https://ivancww.github.io/critical-illness-/?avaEntry=frontend` | `https://ivancww.github.io/critical-illness-/?avaEntry=user` | `https://ivancww.github.io/critical-illness-/?avaEntry=admin` | 70 |
| `medicalreserve` | `https://ivancww.github.io/medicalreserve/` | `https://ivancww.github.io/medicalreserve/?avaEntry=frontend` | `https://ivancww.github.io/medicalreserve/?avaEntry=user` | `https://ivancww.github.io/medicalreserve/?avaEntry=admin` | 90 |
| `retire` | `https://ivancww.github.io/Retire/` | `https://ivancww.github.io/Retire/?avaEntry=frontend` | `https://ivancww.github.io/Retire/?avaEntry=user` | `https://ivancww.github.io/Retire/?avaEntry=admin` | 100 |
| `crm` | `https://ivancww.github.io/AVA-CRM/` | `https://ivancww.github.io/AVA-CRM/?avaEntry=frontend` | `https://ivancww.github.io/AVA-CRM/?avaEntry=user` | `https://ivancww.github.io/AVA-CRM/?avaEntry=admin` | 80 |
| `everbliss` | `https://ivancww.github.io/everbliss/` | `https://ivancww.github.io/everbliss/?avaEntry=frontend` | `https://ivancww.github.io/everbliss/?avaEntry=user` | `https://ivancww.github.io/everbliss/?avaEntry=admin` | 110 |

All seven retain `enabled:true`, `visible:true`, `allowFavorite:true`, `capabilities:{frontend:true,user:true,admin:true}`, `roleVisibility:{frontend:true,user:true,admin:true}` and their existing user/admin settings flags. Their original definitions remain byte-for-byte equivalent as data. Unsupported capability handling is unchanged. Admin launch still requires the existing Platform session and App-scoped authorization; neither registration nor a URL grants access.

`openModule`, `prepareIndependentAppLaunch`, `preserveAvaReturnSurface`, and `restoreAvaReturnSurface` are checked against the pre-change source snapshot. Front/User use the same canonical navigation and Admin uses the same authenticated launch code. WebView rendering and App-owned Return to AVA code are untouched. Source parity and existing launch simulations pass; real WebView/PWA return behavior is **NOT VERIFIED** on devices.

## Actual existing Sheet snapshot

Fresh final-pass read-only inspection covered `homepage_cards!A1:Z20`, `A21:Z1000`, and the same ranges on `homepage_settings`; metadata still identifies all three existing tabs. The rows match the captured fixture exactly and the remaining ranges were empty. Inspection date: 28 October 2026 UTC. No values or formulas were written. The existing `update_notifications` feed and its API are unchanged; its production contents were not modified or re-audited.

| Tab | sheetId | Existing headers / content |
| --- | ---: | --- |
| `homepage_cards` | 101221668 | 12 headers: `id,type,title,subtitle,emoji,module_key,url,category,default_visible,default_order,enabled,updated_at`; two rows below |
| `homepage_settings` | 1028766570 | `key,value,description`; `homepage_version=1`, `personal_cards_enabled=TRUE`, `search_enabled=TRUE` |
| `update_notifications` | 792121377 | Existing feed retained; no schema or content changes proposed |

| Card ID | Type | Official title | module_key | Stored URL | Category | Visible / order / enabled |
| --- | --- | --- | --- | --- | --- | --- |
| `5pay` | `official_app` | Saving Plan | `5pay` | empty | Saving | TRUE / 1 / TRUE |
| `everbliss` | `official_app` | EverBliss | `everbliss` | empty | Planning | TRUE / 2 / TRUE |

Full observed text and timestamps are in `tests/fixtures/platform-sheet-baseline.json`. Empty URLs remain empty; canonical routes continue to come from registration. Five Apps absent from the homepage table remain registered and launchable through the existing App directory.

## Implementation and ownership

- One Workspace Edit control; favorites first, then two-column category cards. Preserve the three existing category identities and local section ordering; rename their official labels to App / 銷售流程 / 高端市場. The actual baseline had three sections, so no fourth category is invented. Up to nine official category cards can be maintained by Admin.
- Carousel uses 4/3/2 cards at the canonical wide/medium/compact boundaries, previous/next buttons, dots, touch gestures and keyboard navigation. No hint button, extra Favorites Edit control or global overflow hiding.
- Existing personal text/link/video-reference cards and legacy folders remain stored. Folder creation is blocked in the UI and submit handler. Existing folder content stays accessible; customization controls share the one Edit mode.
- Favorites contain App IDs only and create shortcuts. Adding/removing/reordering a favorite never changes registration or source placement. App source cards and the directory remain available.
- Personal App labels use the existing `officialOverrides[id].title`; category labels use `areaOverrides`. Untouched values stay absent, so future official names propagate. Existing overrides are not inferred away as “probably defaults”. Unavailable/disabled favorite IDs remain stored when other shortcuts are customized. A stale unmapped Official cache is retained for inspection and cannot crash startup; the safe bundled registry stays available while current Official data is fetched.
- Existing `ava:platform:homepage-order` remains the category-order store; legacy `tools/flow/resources` values are resolved without a competing order field. New optional `favoriteIds` lives inside the existing homepage preference object, under the unchanged schema version. No per-user cloud writes are added.
- Studio can create a new front-only registration, or edit official name/category/order/activation on a selected registration. Existing ID, deployment URL, routes and capability/permission structure remain immutable. A new App's User/Admin capabilities require their own reviewed integration; the new form does not invent them.
- Registry routing is still one resolver. The unchanged bundled registration is the lossless offline baseline; optional `registration_json` in the **same existing homepage_cards row** supplies future registered App routes/capabilities. Official names resolve from `title`; original registration category/order/activation remain distinct from legacy homepage presentation metadata. There is no new registry workbook or parallel tab. Conflicting existing identity, unknown module keys, duplicate row IDs or duplicate module keys fail instead of being silently skipped.
- Homepage bulk saves patch allowlisted cells under the script lock, preserve unknown columns, descriptions/formulas, disabled records, IDs, empty URLs and row ordering, and reject omitted existing records. Registration upsert is keyed by module identity, never URL alone, and rejects another identity using the same canonical deployment. A name-only registry update preserves distinct existing homepage order, display category and visibility fields.
- The new frontend uses `saveWorkspaceConfig` (and `upsertAppRegistration`), which old GAS does not recognize, so a mixed-version request is rejected **before mutation**. The new GAS routes the legacy save name through the same safe writer and rejects legacy requests missing a revision/request ID. All new official mutations require the existing signed Admin session, expected homepage revision, request ID, validation, lock and read-after-write confirmation. Receipt IDs/fingerprints are stored as additional `homepage_settings` rows. Reusing a request for a different payload fails; retrying a committed request returns its receipt only while that revision is current and a fresh full-data fingerprint matches the confirmed data. Out-of-band edits cause rejection even if the revision was not bumped. An edited draft gets a fresh ID.
- The browser verifies persisted/readback flags, request identity, revision and returned record values before accepting the result. HTTP 200 or `success:true` alone fails. Network/auth/conflict/mismatch failures keep drafts and the last confirmed official state.
- SpreadsheetApp does **not** offer a multi-range transaction. Writes have best-effort compensation under the lock and verify the restored cells before claiming restoration. Changed formula-owned cells are rejected; untouched formula/unknown columns are preserved. A failed compensation is explicitly reported as uncertain and must be inspected before retry. No atomic transaction guarantee is claimed.

## Additive schema proposal

| Location | Addition | Purpose |
| --- | --- | --- |
| `homepage_cards` rightmost columns | `default_area` | Already supported by existing source; absent in the live table; add without changing existing cells |
| `homepage_cards` rightmost columns | `registration_json` | Technical registration payload attached to existing module_key; keep row `id` unchanged. Official name resolves only from existing `title`; JSON contains no second official name. Preserve the original registration category/order/activation separately from legacy homepage display tags/placement/visibility flags, which have different existing meanings |
| `homepage_settings` rows | `registry_schema_version=1` | Upsert remains blocked until reviewed mapping is applied |
| `homepage_settings` rows | `workspace_categories` JSON | Stable category IDs, official labels/order/activation, max nine; existing three cannot be removed |
| `homepage_settings` rows | `workspace_request_<requestId>` | Non-secret mutation fingerprint, confirmed revision and data fingerprint for verified idempotency |
| Script Properties | `AVA_REGISTRY_ALLOWED_DEPLOYMENTS` JSON array | Exact approved HTTPS deployment bases, including the existing seven; no secrets in frontend |

No new ID replaces existing IDs. Future rows use the Admin-supplied stable App ID and module key; if a legacy row ID differs from module_key, `sheetId` retains its exact row identity for writes while references resolve by the existing module identity. The migration planner refuses ambiguity.

`node scripts/plan-workspace-migration.js fresh-export.json > plan.json` is **offline only**. It has no network client and cannot mutate Google Sheets. It preserves all existing populated cells, proposes the two rightmost columns, seeds only missing registration payloads, and adds five non-visible homepage rows for the five Apps already in the production registry. A second plan against its applied result contains zero operations. These are existing App mappings, not five new registrations or permission grants.

## Historical test repair

The latest-main failures were stale registry assertions, not newly discovered App runtime failures. Commit `ab1a3c97a702f13114f2d3e729d1096ec65dba89` removed `ci-protection`, `medical-claims`, `recruit` and the Recruit GROW link before this PR. Its diff and latest main were compared directly. No obsolete App was added to satisfy a test.

| Suite | Before on main and initial PR HEAD | Corrected expectation and retained coverage |
| --- | --- | --- |
| `ciapp-integration` | FAIL: expected removed `ci-protection` object | Assert its absence and current canonical `critical-illness` deployment; retain legacy CIApp gateway/Return, source isolation, credential and storage checks |
| `medicalclaims-integration` | FAIL: expected removed root routes | Assert root entry remains absent; retain every legacy local module mode/Return, storage, PWA ownership and design contract assertion |
| `recruit-integration` | FAIL: expected removed registration/GROW link | Assert those remain absent; retain independent source/cache ownership checks |

All three now pass without skips or changes to Independent App source. The exact latest-main seven-App objects, protected launch/return functions and complete `ava-admin-auth.js` are compared directly, in addition to the captured baseline.

## EverBliss authorization decision — separate approval required, NOT EXECUTED

The prior production read showed six server-allowlisted Apps while both pre-PR main and this PR declare EverBliss Admin capability. This is a pre-existing authorization limitation, not permission granted by Workspace. The Admin Hub now says an entry is registered and access requires server authorization. Actual launch denial closes the reserved child window and displays `Admin launch denied`; no success state/navigation is produced. This path is exercised with the real unchanged launch functions in Node and an intercepted browser fixture. No live App Admin access is asserted.

Only after a fresh owner recheck and review of EverBliss's App-specific Admin proof contract, a separately approved owner action could change **only** `AVA_ADMIN_APP_IDS` from the confirmed six IDs to `critical-illness, medical, 5pay, medicalreserve, crm, retire, everbliss`. This would expand eligibility for App-scoped launch tickets/browser proofs to EverBliss for an already valid Platform Admin session; it is an authentication-policy change, not a cosmetic registry edit. Review the App-owned authorization verification and acceptance first. Do not change passwords/secrets or another App's authority. If approval is withheld, retain the deny behavior and document EverBliss Admin as unavailable. This PR does not perform or authorize that property edit.

## Post-approval sequence — NOT EXECUTED

1. Keep production release on HOLD until physical-device/live acceptance and a fresh authorized GAS/property inspection are complete. Full Node and fixture/browser gates must pass on the final PR HEAD. Review the App inventory, exact Sheet binding, schema and permission limitations. Obtain separate explicit authorization for any production action.
2. Before the authorized change window, export the **fresh** existing bound workbook's complete relevant tabs, formulas and metadata; export the complete GAS source/deployed version and record property **keys** securely. Back up user-local data on the acceptance devices. Do not put secrets in the PR or export credentials with user backups.
3. Run the offline planner against the fresh export. Stop on any duplicate, unknown App, row collision or identity conflict. Compare its existing seven-App mappings to the then-current production registry. Do not use the captured fixture as a production migration input.
4. Validate the patch and updated GAS on an explicitly approved isolated test workbook/script, retaining the same schema and existing contracts. Configure only its test allowlist/session credentials. Exercise every negative case and readback gate there. No staging copy was created by this task.
5. During the separately approved production window, pause Platform official writes. Verify Sheet revision still equals the exported revision and recheck every touched cell; abort if it changed. Apply the reviewed cell patch to this **same workbook**, never clear/replace a table. Preserve original twelve columns and the settings description column. Set `homepage_version` to a fresh unique revision as the final migration cell change, then read back all registrations, categories and untouched cells.
6. Configure the exact approved deployment allowlist on the **existing bound script**. Do not change `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, existing tickets/grants, App GAS settings or App permissions. The EverBliss allowlist discrepancy is a separate pre-existing decision; do not silently fix it as part of schema application.
7. Publish a new version of this same Platform GAS deployment only after separately authorized, preserving its URL/access policy and existing GET, notification and App Admin authentication routes. Old homepage reads remain valid. Old Platform official writers lacking a revision/request ID are deliberately rejected with an upgrade/reload error; they cannot overwrite the new registry columns. This is a fail-closed write-contract upgrade, not support for unsafe legacy bulk overwrites.
8. Release the approved Platform frontend **after** GAS/migration readiness, retaining independent App deployment boundaries. The source version is v1.15.0; the existing release process must set final release source identity as appropriate. The new frontend's writes against old GAS fail confirmation safely; do not treat an old GAS response as success.
9. Run authenticated live acceptance after authorization: read all seven Apps, verify the exact routes, supported User/Admin entry, embedded WebView and Return to AVA, PWA reopen/local preferences, one authorized staging registration then repeat/upsert/rename and override checks. Any production write test requires separate authorization. Do not mark the whole integration passing from simulations.
10. Resume official writes only after confirmed parity and readback. Receipt-row retention/cleanup should be reviewed for operational scale; this PR does not delete receipts or other production data.

## Rollback — NOT EXECUTED

- Stop official writes; preserve failed drafts and current diagnostic/revision evidence without tokens.
- Roll the Platform frontend back to the recorded prior release. Keep independent App deployments unchanged and do not clear LocalStorage/IndexedDB or remove user favorite/override data; extra local fields may be ignored by the old shell.
- Restore the existing GAS deployment to recorded version 6 only under approval. **Old version 6 has destructive bulk save behavior**: keep Platform official writes disabled until an authorized owner restores the pre-migration Sheet cells or applies a reviewed safe rollback writer. Never let an old writer erase additive registration columns.
- The isolated fixture roundtrip exercises `node scripts/plan-workspace-migration.js original-export.json --rollback current-export.json confirmed-migration-revision`. The offline planner returns guarded reverse cell operations, refuses stale revisions and any intervening data/formula change, and requires official writes paused and the legacy destructive writer disabled. It never executes against Sheets. Blank additive cells/rows may remain; it does not delete tables.
- Prefer retaining harmless additive columns/data during rollback. If an exact Sheet rollback is required, compare against the migration backup and restore only the specifically changed cells after checking for legitimate intervening writes. Never replace the entire live workbook blindly. Restore the original revision only together with its corresponding confirmed data, then verify readback.
- Remove or revert only the newly introduced allowlist property if appropriate under approval; never alter existing authentication secrets, App allowlists or active App data as a collateral rollback action.
- Recheck seven-App identity/routing parity, original two homepage records, settings descriptions, existing local overrides and startup before resuming writes. A failed/uncertain compensation requires manual inspection.

## Validation record

| Required area | Status / evidence |
| --- | --- |
| Seven-App inventory/ID/module key/URL/entry/flags/order parity | PASS — exact full-object comparison and protected navigation-source comparison |
| Platform launch, User/Admin entry, Return routing, SW ownership | PASS — existing Node contract/runtime suites; real WebView and App-owned return/device E2E NOT VERIFIED |
| Legacy Sheet two cards/settings and safe defaults | PASS — captured live fixtures parsed by new code; no source identity changed |
| Existing local overrides, personal cards, legacy folders and section order | PASS — regression fixtures; actual installed-device data BLOCKED/unavailable |
| New registration creates once / repeated upsert / idempotent retry | PASS — GAS emulator and offline migration tests |
| Official rename / personal override precedence | PASS — shared resolver/preference and server readback tests; live UI NOT VERIFIED |
| Favorites add/remove/reorder keeps source App | PASS — preference VM and CI Chromium interactions, including reopen persistence and zero external POSTs |
| 4/3/2 carousel, category 2-column/max-nine/no-folder-creation | PASS — model/security/schema checks and CI Chromium across 390/650/651/768/820/1000/1001/1024/1440px; arrows, dots, keyboard, synthetic TouchEvent swipe, normal/Edit overflow and one Edit control |
| User cannot change official identity/routing/permissions | PASS — immutable source comparison, authenticated API rejection and allowlist tests |
| Auth, stale revision, invalid input, duplicate IDs, concurrent revision writers, lock contention, network failure, readback mismatch and rollback | PASS — isolated GAS/HTTP response simulations; not live server tests |
| Release identity, JavaScript syntax, whitespace diff | PASS — `node scripts/release-check.js`, script compilation and `git diff --check` |
| Full existing suite | PASS — 41 files, 41 pass / 0 fail / 0 skipped / 0 cancelled, including all four Workspace-specific suites. The final CI also runs the entire suite with no exclusions |
| Workspace browser QA | Exact-HEAD gate in [final CI]({{FINAL_CI_RUN}}), Chromium via Node Playwright 1.62.1: nine widths, normal/Edit overflow, source/favorite/local-folder preservation and intercepted EverBliss authorization denial. A passing uploaded evidence record is required; earlier CI is not substituted. Browser emulation is not physical certification |
| Canonical Design System validator | Exact-HEAD gate in [final CI]({{FINAL_CI_RUN}}): CSS parsing/tokens/aliases/boundaries and Chromium 11-viewport interaction checks via Python Playwright 1.62.0. No canonical CSS modified; passing uploaded evidence required |
| Migration / rollback | PASS — isolated in-memory fixture only: additive mapping, second-plan zero operations, workbook/ID/module/row/schema/header collisions, formula/description roundtrip, rollback stale revision and intervening-edit refusal |
| Cache / PWA upgrade | PASS — service-worker VM replaces a stale Workspace script online with cache:no-store and reuses the confirmed upgraded script offline; all seven independent deployments remain outside Platform worker ownership. Real installed PWA upgrade NOT VERIFIED |
| Current GAS / EverBliss allowlist read-only recheck | BLOCKED / NOT VERIFIED — unsigned editor browser. Earlier verified six-ID allowlist snapshot is recorded separately; no fresh production permission claim |
| Physical iPad portrait/landscape, mobile/foldable, installed PWA | NOT VERIFIED — no physical acceptance devices |
| New GAS source deployment, live authorized Official Read/Write, post-migration browser integration | NOT EXECUTED — prohibited production mutation/deployment; version-6 source/deployment inspection passed only for the pre-existing baseline |

Commands for repeatable review:

```sh
node --test --test-reporter=tap tests/*.test.js
node scripts/release-check.js
node scripts/plan-workspace-migration.js tests/fixtures/platform-sheet-baseline.json
node tests/workspace.browser.js
python3 design-system/validate.py
git diff --check
```

The browser-dependent commands need their documented dependencies/runtime installed; CI executes both. Never interpret the fixture/emulator tests as live server writes or physical-device certification.
