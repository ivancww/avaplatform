# Homepage Cloud Default integration

AVA Platform `v1.13.0` treats the Production `MODULE_REGISTRY` in `index.html` as the authority for module identity, permission and routing. The GAS/Google Sheet source controls only official homepage presentation, default visibility, area and order. A cloud `url` is checked against the registry but never replaces a registry destination.

At implementation time, `health` returned `{"success":true,"service":"AVA Platform Cloud","status":"ok"}`. `getHomepageConfig` returned `{"success":false,"error":"Missing sheet: homepage_cards"}`. Existing browser users continue with the safe bundled default when no last-known-good cache exists. A new standalone onboarding does not claim that fallback is current and instead presents Retry.

## Cloud and user ownership

- Cloud: official card metadata, default visibility/order, feature switches and `homepage_version`.
- Local user persistence: official-card presentation/visibility/area/order overrides, layout order and Personal Cards.
- Last-known-good cache: only a successful, structurally valid and non-empty reconciled response is promoted. Unavailable, timed-out or malformed responses use that cache; without one, the bundled production configuration is used.
- Restore Official Homepage fetches the endpoint again and clears only official visibility/order and layout overrides. Personal Cards remain local and are retained.

## `homepage_cards` copy/paste data

Create the `homepage_cards` worksheet with the schema from the task, then paste the following tab-separated rows. Module keys, titles and destinations come from the current Production Module Registry. `medical-reserve` intentionally has no URL because its Production Registry currently provides no entry; do not invent one.

```tsv
id	type	title	subtitle	emoji	module_key	url	category	default_visible	default_order	enabled	updated_at	default_area
5pay	app	5Pay · Saving	將未來目標、時間與累積效果變成具體數字。	💰	5pay	modules/5pay/index.html?avaEntry=frontend	planning	TRUE	0	TRUE	2026-09-18T00:00:00Z	area-1
medsave	app	Medsave · Medical Reserve	將未來醫療保費、儲備與生活規劃連結成完整引導流程。	🏥	medsave	modules/medsave/index.html?avaEntry=frontend	medical	TRUE	1	TRUE	2026-09-18T00:00:00Z	area-2
medical-claims	app	Medical Claims	由醫療需要、實況案例到保障選擇。	📋	medical-claims	modules/medicalclaims/index.html?avaEntry=frontend	medical	TRUE	2	TRUE	2026-09-18T00:00:00Z	area-3
crm	app	CRM · Client Review Center	由前設查詢、保單資料到整體保障總覽及下一次 Review。	👥	crm	https://ivancww.github.io/CRM/index.html?avaEntry=frontend	client-review	TRUE	3	TRUE	2026-09-18T00:00:00Z	area-1
recruit	app	AVA Recruit · Career Discovery	由理想工作、現職取捨到保險事業與雙 Career Path 的中性探索流程。	🚀	recruit	https://ivancww.github.io/recruit/index.html?avaEntry=frontend	recruitment	FALSE	4	TRUE	2026-09-18T00:00:00Z	area-2
ci-protection	app	CI Protection	將危疾保障連結到確診後的生活需要。	❤️	ci-protection	../CIApp/?mode=frontend	protection	FALSE	5	TRUE	2026-09-18T00:00:00Z	area-3
medical-reserve	app	Medical Reserve	將未來醫療費用及所需儲備具體化。	🏥	medical-reserve		medical	FALSE	6	TRUE	2026-09-18T00:00:00Z	area-1
```

The `homepage_settings` worksheet must contain `homepage_version`, `personal_cards_enabled`, and `search_enabled`. Increment `homepage_version` whenever the official homepage defaults change.

## Ivan 需要手動完成的設定

1. 在 production Spreadsheet 的 `homepage_cards` 最右側新增 `default_area` 欄，不要移除或重新命名既有欄位。既有資料填入 `area-1`、`area-2` 或 `area-3`；空值會 backward-compatible 地當作 `area-1`。
2. 在 Apps Script Project Settings → Script Properties 建立：
   - `ADMIN_PASSWORD_HASH`: Admin password 的 SHA-256 lowercase hex（可在本機用 `printf %s 'YOUR_PASSWORD' | sha256sum` 產生；不要把 password 或 hash commit）。
   - `SESSION_SECRET`: 至少 32 random bytes 的不可預測 secret（例如本機 `openssl rand -hex 32`）。
3. 用 repository 的 `gas/Code.gs` 更新現有 GAS project，確認 Spreadsheet-bound deployment 仍指向 production Sheet。
4. 建立新的 Web App deployment version，Execute as 設為 owner，沿用現有可讀 deployment access policy。不要改 production endpoint 前先以 deployment test URL 驗證。
5. 驗證 `?action=health` 及 `?action=getHomepageConfig` 保持可讀，再於 AVA Studio 測試錯誤 password 被拒、正確 password 可取得 30 分鐘 session，並以一個可逆標題變更驗證「同步雲端」及 `homepage_version` 更新。
6. 驗證寫入後 Sheet 沒有 Personal Cards、Personal Overrides、User Name 或 Independent App business data，才把新 deployment 設為 production。
