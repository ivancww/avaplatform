# Medical Claims upstream baseline

The integrated runtime was imported incrementally from `ivancww/medicalclaims` main at commit
`3c7a71a0b66702d4bb773eb8bee744610c5aa570` (production version `7.5.1`).

AVA integration files add explicit `avaEntry=frontend|user|admin` behavior, platform routing,
design-system presentation, and platform backup ownership. The upstream claim rules and
calculation engine in `script.js` are retained byte-for-byte from that baseline.
