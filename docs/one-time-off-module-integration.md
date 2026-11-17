# One-Time-Off Phase 1 integration

The existing `MODULE_REGISTRY` contains one independent App record, ID `one-time-off`, repository `ivancww/one-time-off`. No source, calculations, GAS, App storage or backups are copied into Platform. Existing registry-driven Front/User/Admin directories and the `deployment-pending` gate remain the only routing mechanism.

No verified App deployment URL was available. One-Time-Off main is the initialization commit while App PR #1 contains the implementation. The new record has no destination URLs and remains hidden/disabled with `availability: deployment-pending`. `frontend: true` declares its intended customer-facing capability; `user: false` remains gated by live entry validation, and `admin: false` is explicit. It does not appear in customer directories, homepage defaults, User navigation or AVA Studio. Existing seven enabled registrations, cloud defaults, favourites and user placement are preserved.

The App owns Front (`?avaEntry=frontend`) and User (`?avaEntry=user`) entry behavior, draft preview, Save Local, IndexedDB, custom pages, backups and Return to AVA. Local test-only promotion supplies loopback URLs and enables User in memory. It is not a deployment URL or a production capability claim. Review `ivancww/one-time-off` PR #1 and its `docs/PLATFORM-INTEGRATION.md` for cross-repository browser evidence and Admin Phase 2 requirements.

Before activation, verify an Owner-approved canonical HTTPS deployment and its exact App origin, Front/User entry, edit/preview/save/reopen, Return to AVA, Official/User isolation, backups, responsive behavior, App shell upgrades and installed PWA. Then update this same registration through a reviewed PR. Physical iPad/HONOR and WebViews remain NOT TESTED; local viewports and standalone state are simulations. Admin must remain false until its separate browser-bound one-time session, ticket/nonce, origin/expiry/replay and server authorization checks pass; no Admin origin or auth allowlist is configured here.

Platform version v1.15.4 is a proposed unmerged change under the existing release governance. No merge, deployment, DNS, authentication or production Sheet/GAS changes are included.

## Final release preparation — 17 November 2026 (Hong Kong)

App PR #1 now prepares an allowlisted static artifact and a separate Owner-only, exact-main-SHA, manual Pages release workflow. Neither has deployed the App. Pages settings were inaccessible through the available API (`Forbidden`), so no canonical App URL is verified. The conditional GitHub default project-site address is not an activation destination. The approved deployment output and actual browser checks must establish the URL before this record changes.

The packaged App test uses `/one-time-off/` on loopback, including relative assets, manifest/worker scope, offline shell, Preview → Save Local → reopen, text custom pages/backups and four viewport sizes (iPad portrait/landscape, HONOR unfolded/folded). Separate registry-driven Platform/App navigation uses in-memory loopback promotion only. Both ordinary-browser and standalone checks are simulations; deployed integration, physical devices, installed PWA and WebViews remain NOT TESTED.

Activation sequence: Owner approves App merge; separately approves exact-SHA deployment and Pages settings/environment protection; verify the action's actual canonical HTTPS URL and full Front/User/preview/save/reopen/return flow; only then propose verified URLs and User capability/visibility in this same MODULE_REGISTRY. Platform merge/deployment requires its own explicit approval. Until then, `enabled:false`, `visible:false`, empty entry modes, `user:false`, and `admin:false` remain unchanged.

Authenticated GAS live synchronization is a separate release gate. The validated, labelled App snapshot supports staging QA while gateway approval is pending; it is never evidence of live data. No production hosting, DNS, GAS/Sheet, Firebase or authentication configuration is altered by this preparation. See App `docs/RELEASE-PREPARATION.md` for the exact Owner checklist.
