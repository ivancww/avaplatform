# Independent App Release Notification Standard v1.0

Status: **AVA Mother Standard — target-state mandatory contract**. This document specifies required behavior; it does not certify existing deployments or authorize cross-repository changes.

## Ownership and scope

- AVA Platform owns **Platform-only** announcements, platform release notes, and shared standards. It must not show Independent App release/update announcements in the Platform notification center or duplicate their popup state.
- Each Independent App owns its release notes, display, history, per-device acknowledgement state, deployment, and testing in its own repository. No central Platform notification publication, Platform release, Platform registry version bump, or Google Sheet notification entry is a prerequisite for an Independent App release.
- Applies to every existing and future customer-facing Independent App, including Frontstage, User and Admin entry where applicable. Adopt via separate App-owned PRs; existing Apps are not automatically compliant.
- Platform's existing notification feed must be migrated carefully: retain genuinely Platform-wide announcements and preserve other Platform notification capabilities; stop surfacing App-specific update entries, without deleting source records or changing Official datasets unnecessarily.

## Release-note contract

Each App must ship a versioned, App-owned, locally available release-note manifest with at least: unique release ID, App ID, public version, publication date, concise Traditional Chinese title, user-visible changes, and an explicit published/visible flag. Version/release identity must be stable and unique; do not rely on lexicographic version comparison alone. The manifest may be generated at build/release time. Only published releases that actually reached the user may trigger notices; development commits, PRs, unpublished builds and routine Official dataset/Google Sheet refreshes must not trigger them. Security-critical notices may use an explicit separate severity field, never silently convert all data refreshes into releases.

## Open-App experience

- On opening/reopening an App after its new published Shell has become active, show a concise **「更新通知」** dialog containing App name, actual current version, and verified user-facing changes. Offer **「了解，開始使用」** and a way to review full release history.
- Show each release notice **once per device/browser profile** after acknowledgement, including installed PWA where storage scope permits. Persist acknowledgement in App-owned local storage, separate from User Edit and Official data. Do not replay on every route change, tab focus, or ordinary reopen.
- When several published releases were missed, consolidate their unacknowledged user-visible changes in a bounded, readable notice, with complete history accessible separately.
- Do not show the current release as a new update to a first-time visitor with no prior observed App version; establish a baseline and allow history access. Where prior state exists, compare stable release identity and notify only for genuinely unseen releases.
- The dialog must be dismissible, keyboard accessible, responsive, safe-area compatible, and follow AVA Design System; preserve customer journey context, scroll position and unsaved edits where applicable. Do not obstruct required security or Official warnings.
- If release-note metadata is unavailable or invalid, the App must continue safely without a false notice. Offline launches may use verified bundled release notes; notification must not require network access or block launch.
- History is accessible from a modest **「更新紀錄」** action in the App shell/help area, without replacing or weakening **「返回 AVA」**. Keep newest releases first.

## Independence, safety and rollout

- Notification state is not the Shell update mechanism: preserve the existing Automatic Official App Shell Update Standard, including safe Service Worker activation, bounded reload, offline fallback, cache ownership and User/Local data preservation.
- Never clear localStorage, IndexedDB, backups, User Overrides, or unrelated App data to implement notification behavior. Acknowledgement is local and does not require Platform identity, cross-origin storage, GAS writes, or a new authorization permission.
- Keep App business logic, financial calculations, Official data contracts, User Edit, backup/restore and independent deployments unchanged.
- Migrate the Platform notification center to Platform-only items in its own PR. Each App adds the manifest, popup and history in its own PR. Do not merge or deploy without Product Owner approval.

## Acceptance gate

For each applicable App, report PASS / FAIL / BLOCKED / NOT VERIFIED for: published release triggers once; acknowledgement persists across reload and reopen; no popup on same release; missed releases consolidate; first install does not show a misleading update; history remains accessible; offline behavior; malformed manifest safe fallback; no false notice from data-only refresh; browser/PWA and iPad/HONOR Magic V5 unfolded parity; keyboard/focus/safe areas; no loss of User/Local data; no reload loop; independent deployment and Platform-only notifications. Physical-device and live deployment checks remain NOT VERIFIED until actually executed.


## Mandatory version governance and enforced Shell refresh (v1.1 addendum)

Every production-facing Independent App change MUST increment that App's **own public semantic version** (patch, minor or major as appropriate), including UI, PWA, release-notification behavior, Official Data wiring, permissions and customer-visible content. Each release PR MUST carry the new visible version, a published same-origin release manifest, dated Traditional Chinese release notes and stable immutable release identity. Repository build SHA is supplementary metadata, not a substitute for a human-readable version. Pure tests/docs-only commits that do not change the shipped App do not require a user-facing bump. CI MUST reject any production-facing change whose release version fails to increase, whose visible version mismatches the manifest, or whose published notes do not describe the release. An Official Google Sheet-only dataset edit does not automatically create an App Shell release.

**Forced-update trigger:** when online App startup/reopen detects a trusted, same-origin, *published newer Shell version* than its currently running shell, the App MUST prevent continued use of stale application features, show an accessible “必須更新” dialog with the new version and concise changes, and offer an “立即更新” action that fetches/activates the verified current App shell and reloads safely. Do not compare versions lexicographically or trust remote arbitrary URLs. A normal same-version reopen only presents a once-per-device nonblocking “更新通知” for a previously observed version followed by a new version. An installed PWA and normal browser must work the same way. Use App-owned release notes and state, never the Platform's notification center.

**Safety/fail-open for outages:** when offline or version-manifest check fails, do not trap the user in an unusable screen; permit the last validated offline Shell with a clear offline state, and repeat version check on the next online launch. Never invent a release or block based on unverified metadata. Do not force a destructive reload when there are unsaved User Edit drafts: first require explicit Save Local / Cancel (or preserve the draft transactionally), then complete the new-shell activation. Limit reload to once per confirmed deployment version, avoid reload storms and preserve IndexedDB, local storage, backups, User data, Official Layer, and independent App permissions. Release notes/acknowledgements must survive ordinary reopen but must not overwrite User Edit.

**Required verification per App:** newer remote published version locks stale shell; update action activates and reloads current shell; no lock on same/older/invalid manifest; offline permits last good shell; first install baseline; once-only notes acknowledgement; background/tab return check; unsaved edit protection; no infinite reload; version and manifest agree; all compatible devices and standalone PWA. The docs-only Mother PR does not imply these App gates are live.
