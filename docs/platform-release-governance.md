# AVA Platform release governance

`index.html` contains the single authoritative human-readable `AVA_PLATFORM_VERSION` declaration. All visible labels derive from that declaration.

`platform-release.json` is the public release identity served with the Platform. It must match the visible version and contain the full source commit SHA used for the official release. It contains no credentials, tickets, grants, or browser proofs.

Every functional Platform release increments the version in `index.html` and updates `platform-release.json` in the same release PR. Documentation-only and test-only changes do not require a release bump. The release workflow rejects a functional diff when the version is unchanged or not greater than the base version.

Independent Apps keep their own versions; Platform metadata never changes them. The Pages deployment URL and the stable Service Worker cache name remain unchanged. The deployed `platform-release.json` and the GitHub Pages source commit together identify the production source without exposing secrets.
