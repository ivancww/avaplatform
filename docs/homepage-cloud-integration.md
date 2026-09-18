# Homepage Cloud Default integration

AVA Platform `v1.12.0` treats the Production `MODULE_REGISTRY` in `index.html` as the authority for module identity, permission and routing. The GAS/Google Sheet source controls only official homepage presentation, default visibility and default order. A cloud `url` is checked against the registry but never replaces a registry destination.

At implementation time, `health` returned `{"success":true,"service":"AVA Platform Cloud","status":"ok"}`. `getHomepageConfig` returned `{"success":false,"error":"Missing sheet: homepage_cards"}`. This is handled as a first-run cloud failure, so the production bundled module configuration remains visible.

## Cloud and user ownership

- Cloud: official card metadata, default visibility/order, feature switches and `homepage_version`.
- Local user persistence: hidden/shown official IDs, personal ordering, layout order and Personal Cards.
- Last-known-good cache: only a successful, structurally valid and non-empty reconciled response is promoted. Unavailable, timed-out or malformed responses use that cache; without one, the bundled production configuration is used.
- Restore Official Homepage fetches the endpoint again and clears only official visibility/order and layout overrides. Personal Cards remain local and are retained.

## `homepage_cards` copy/paste data

Create the `homepage_cards` worksheet with the schema from the task, then paste the following tab-separated rows. Module keys, titles and destinations come from the current Production Module Registry. `medical-reserve` intentionally has no URL because its Production Registry currently provides no entry; do not invent one.

```tsv
id	type	title	subtitle	emoji	module_key	url	category	default_visible	default_order	enabled	updated_at
5pay	app	5Pay · Saving	將未來目標、時間與累積效果變成具體數字。	💰	5pay	modules/5pay/index.html?avaEntry=frontend	planning	TRUE	0	TRUE	2026-09-18T00:00:00Z
medsave	app	Medsave · Medical Reserve	將未來醫療保費、儲備與生活規劃連結成完整引導流程。	🏥	medsave	modules/medsave/index.html?avaEntry=frontend	medical	TRUE	1	TRUE	2026-09-18T00:00:00Z
medical-claims	app	Medical Claims	由醫療需要、實況案例到保障選擇。	📋	medical-claims	modules/medicalclaims/index.html?avaEntry=frontend	medical	TRUE	2	TRUE	2026-09-18T00:00:00Z
crm	app	CRM · Client Review Center	由前設查詢、保單資料到整體保障總覽及下一次 Review。	👥	crm	https://ivancww.github.io/CRM/index.html?avaEntry=frontend	client-review	TRUE	3	TRUE	2026-09-18T00:00:00Z
recruit	app	AVA Recruit · Career Discovery	由理想工作、現職取捨到保險事業與雙 Career Path 的中性探索流程。	🚀	recruit	https://ivancww.github.io/recruit/index.html?avaEntry=frontend	recruitment	FALSE	4	TRUE	2026-09-18T00:00:00Z
ci-protection	app	CI Protection	將危疾保障連結到確診後的生活需要。	❤️	ci-protection	../CIApp/?mode=frontend	protection	FALSE	5	TRUE	2026-09-18T00:00:00Z
medical-reserve	app	Medical Reserve	將未來醫療費用及所需儲備具體化。	🏥	medical-reserve		medical	FALSE	6	TRUE	2026-09-18T00:00:00Z
```

The `homepage_settings` worksheet must contain `homepage_version`, `personal_cards_enabled`, and `search_enabled`. Increment `homepage_version` whenever the official homepage defaults change.
