# Workspace folders — v1.15.1 review

Status: **HOLD — browser QA and production acceptance outstanding**. This report describes source and isolated tests, not deployed behavior.

Base: `5e43ac9cd26f59a1262ca85e6e554467f51ec337` (merged PR #75). Production Sheet was inspected read-only on 28 October 2026: `homepage_version=3`, `registry_schema_version=1`; seven existing App records and five enabled folder records, with `area-3` retained and disabled. The exact snapshot is `tests/fixtures/platform-sheet-v3.json`. No production migration is proposed or executed.

| Folder | Existing ID | Official App IDs from `default_area` |
| --- | --- | --- |
| 儲蓄 App | area-1 | 5pay, everbliss, retire |
| 保障 App | area-4 | medical, critical-illness, medicalreserve |
| 基金 App | area-5 | none |
| 數據 App | area-6 | crm |
| 銷售流程 | area-2 | none |

`homepage_cards.default_area` is authoritative for official membership; metadata `appIds` is checked and mismatches produce warnings, not removal from the registry/source directory. Existing local area/folder overrides take precedence for that user. Names/subtitles still come from existing cards and local overrides. Favorites are unchanged explicit local IDs. Legacy folders and personal cards remain in the existing preference and are rendered in 個人內容, even if their old category is disabled.

The folder carousel pages nine at a time; grid columns respond to width. The modal contains every assigned available App, preserves canonical launch code and supports Escape, backdrop close, focus restoration and inert background. The existing Edit button controls personal naming, ordering, placement and favorites. New folder IDs remain `area-N`, up to 99; the existing four-field categories contract remains valid.

## GAS and compatibility

New `saveFolderWorkspaceConfig` action extends the existing locked, authenticated, revision-aware writer with validated `workspace_folder_metadata` and `workspace_folder_layout` settings, idempotency fingerprint and read-after-write checks. A new frontend sends the new action for folder configurations; old GAS rejects it before mutation. New GAS rejects old homepage writers against folder-aware configuration, preventing silent metadata drift. New registrations update the existing area-1 membership metadata in the same locked mutation. No notification, independent App or authentication contract is deliberately changed. No production GAS source/deployment or Script Properties were modified.

Sheet/GAS consistency depends on application of separately approved source/deployment changes. Existing Sheet data does not need to be migrated again. Before any approved deployment, export a fresh workbook including formulas and settings, inspect the deployed GAS and properties, verify revision and mapping, and test authenticated writes in a separately approved staging environment. Deploy the reviewed GAS before the frontend. Pause direct Sheet edits during official writes because the script lock cannot serialize human edits. On rollback, disable official writes, restore the recorded Platform and GAS versions, preserve the v3 data and local settings, and do not let old destructive writers overwrite newer columns or notification records. Live post-deployment checks require separate approval.

## Validation and remaining gates

- Full local Node regression: 44/44 files passed, zero failures or skips (isolated local Node runtime). Workspace v3 fixture, GAS auth/negative cases, legacy routing, notification and PWA contracts are included.
- Browser blocker: local Playwright Chromium is absent; the official installer repeatedly returned truncated ZIP downloads. The cloud browser could not connect to the local fixture server (`ERR_CONNECTION_REFUSED`). No screenshot or browser pass is claimed.
- `tests/workspace-folders.browser.js` exercises fixture-only six viewport sizes, nine-folder page, pagination, swipe, centered dialogs, launch, edit/favorites and eight requested screenshots. It must be run against installed Playwright Chromium; no browser result is claimed until actually executed.
- Canonical Design System validator requires Python Playwright and Chromium and must be run before the PR is declared ready. The Service Worker cache name remains deliberately stable under the existing network-first shell contract; changing a manual cache version is not required by this architecture.
- Physical iPad/Safari, installed PWA upgrade, live GAS authorization and post-deployment acceptance: **NOT VERIFIED**.
- Prior read-only GAS allowlist snapshot omitted EverBliss; current production authorization remains unverified. No permission was broadened.

## Resume in a browser-capable environment

```sh
node "$CODEX_PRIMARY_RUNTIME_NODE_MODULES/playwright/cli.js" install chromium
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/workspace.browser.js
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/workspace-folders.browser.js
python3 -m pip install tinycss2 playwright==1.62.0
python3 -m playwright install chromium
python3 design-system/validate.py
node --test --test-reporter=tap tests/*.test.js
```

Fix any failures and rerun before committing, pushing the existing branch, and creating the single requested PR. Browser screenshots are written to `/tmp/ava-workspace-final/screenshots/` and the CI artifact uploads that directory. Do not merge or deploy.
