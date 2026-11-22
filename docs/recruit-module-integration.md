# AVA Recruit — Platform Front / User integration (v1.15.7)

## Independent App ownership

AVA Recruit remains the independently deployed `ivancww/recruit` application. AVA Platform
registers only navigation metadata and the official Workspace folder **招聘App**.
It does not copy, embed, rebuild or cache Recruit source code, recruitment content,
candidate sessions, calculations, forecast logic or business rules.

Recruit merged PR #3 into `main` at `ee33eb4974c3d4c13520a78990e010dd24e5e70e`.
This Platform change registers the public Frontstage and personal User Edit only.
**GAS Admin integration remains unverified; this change does not authorize it.**

## Registered entry contexts

| Surface | Address | Capability |
| --- | --- | --- |
| Frontstage | `https://ivancww.github.io/recruit/?avaEntry=frontend` | `frontend: true` |
| 我的流程 / User Edit | `https://ivancww.github.io/recruit/?avaEntry=user` | `user: true` |
| AVA Studio Admin | **Not registered** | `admin: false` |

User Edit modifies the actual Frontstage and maintains independent local User overrides,
personal custom text pages, preview, Save Local, and device-local backups. It must not
change the official Sheet or the Recruit Engine.

## Official Workspace folder

- Folder ID: `area-7`
- Exact display name: `招聘App`
- Default member: `recruit`
- Folder icon: `workflow`; independent category `recruitment`
- Existing `area-1` savings, other cloud folders, app placement overrides,
  favourites and personal content remain unchanged.
- If production Cloud V7 does not list `area-7`, the Platform presentation adds
  the missing folder in memory; it does **not** rewrite GAS V7 or Google Sheet.
- Existing explicit user placement wins. The Recruit fallback placement applies
  only when the user has not placed it elsewhere.
- Legacy workspace and cloud folder-carousel modes should both show the folder.

## Admin and security gating

`ava-admin-session-v1` server-side Admin remains closed. Do not enable
`admin:true`, add an Admin destination, or edit `AVA_ADMIN_APP_IDS` as part of
this Frontstage-only integration. Separate verification must cover browser proof,
one-time session, Replay denial, specific operations, formula injection,
Sheet write/readback and scoped return to AVA Studio.

## QA and rollout

- Recruit PR #3 regression and simulated browser tests previously passed; those
  are not proof of published GitHub Pages or production GAS Admin.
- Platform required QA: `tests/recruit-integration.test.js`, complete
  Platform node tests, workspace folder carousel and legacy fallback browser tests.
- Platform v1.15.7 release is separate from open PR #84 v1.15.6, which concerns
  GAS allowlist revocation. Rebase in case PR #84 lands before this PR.
- Merge and production deployment only after required CI and explicit Owner direction.
