# AVA Platform release governance

`index.html` contains the single authoritative human-readable
`AVA_PLATFORM_VERSION` declaration. All visible Platform labels derive from
that declaration.

`platform-release.json` is the public Platform release identity served with
the Platform. It must match the visible version and contain the full source
commit SHA used for the official Platform release. It contains no credentials,
tickets, grants, or browser proofs.

Every functional Platform release increments the version in `index.html` and
updates `platform-release.json` in the same release PR. Documentation-only
and test-only changes do not require a Platform release bump. The release
workflow rejects a functional Platform diff when the version is unchanged or
not greater than the base version.

Independent Apps keep their own versions; Platform metadata never changes them.
Every production-facing Independent App change—including Admin UI,
authorization, Official Data synchronization, PWA behavior, or other
user-visible functionality—must increment that App's human-readable version
under the App's own release governance. The App's build SHA is secondary
technical metadata. An Official Data schema/version and an App frontend
version remain separate identities.

The Pages deployment URL and the stable Platform Service Worker cache name
remain unchanged. The deployed `platform-release.json`, the GitHub Pages
source commit, and each App's own release metadata together identify the
production source without exposing secrets.
