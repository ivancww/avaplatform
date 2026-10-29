# Platform identity reconciliation — static audit

Baseline Platform `main` 669008e8aa5e689f08fac7a059578a6829a01702, `index.html` bundled MODULE_REGISTRY. `workspace.js` merges cloud `config.registrations` into `registryState.modules`; the effective production registry can differ and has not been read. Therefore absence below means absent from bundled source, not proved absent from the live cloud registry. All seven entries declare frontend/user/admin true and roleVisibility true; flags express current registry configuration, not verified actual capability or authorization. Each registered URL below appends `?avaEntry=frontend`, `?avaEntry=user`, or `?avaEntry=admin` respectively. Availability, returns and live auth are NOT VERIFIED.

| Canonical ID | Registry destination | Relationship to requested scope | Current declaration / caveat |
| --- | --- | --- | --- |
| `5pay` | https://ivancww.github.io/5pay-saving-plan/ | requested 5pay repo | F/U/A true; verify safe editing and admin |
| `medical` | https://ivancww.github.io/medical/ | requested medical repo | F/U/A true; user return source currently root |
| `critical-illness` | https://ivancww.github.io/critical-illness-/ | requested CI repo | F/U/A true; #34 pending |
| `medicalreserve` | https://ivancww.github.io/medicalreserve/ | separate repository, not `medsave` or `retiremedical` | F/U/A true; do not remap based on name |
| `retire` | https://ivancww.github.io/Retire/ | separate retirement app, not `retiremedical` | F/U/A true; preserve |
| `crm` | https://ivancww.github.io/AVA-CRM/ | requested CRM | F/U/A true in registry; inspected App source declares admin false; resolve with real deployed auth evidence |
| `everbliss` | https://ivancww.github.io/everbliss/ | requested EverBliss | F/U/A true; verify |
| none | https://ivancww.github.io/medsave/ | requested independent repo; successful Pages run at a60e889 | no entry in bundled registry; effective cloud registry NOT VERIFIED; `modules/medsave-adapter.js` and `modules/medsave/index.html` are legacy embedded/backup assets, not proof of a registered independent destination |
| none | https://ivancww.github.io/retiremedical/ | requested independent repo; successful Pages run at 919b28a | no entry in bundled registry; effective cloud registry NOT VERIFIED; old Platform PR #16 proposes it but is unmerged and stale; do not assume approval |

Source return: 5pay parent/referrer-based resolver; Medical User root; CI context/root; CRM and EverBliss explicit User surface; medsave root; retiremedical User surface only for recognized entry. See [audit](USER-EDIT-SEVEN-APP-AUDIT.md); live redirects, AVA sidebar, PWA/WebView, flags and return are NOT VERIFIED. The bundled registry lists seven identities but only five belong to the requested seven-repository scope. `medicalreserve` and `retire` must not be removed or silently relabelled.

Smallest future proposal, subject to **separate product-owner approval**: first inspect the effective cloud registry read-only, then establish canonical IDs, intended visibility and deployed URLs for medsave/retiremedical; independently verify source ownership, real Front/User support and Admin auth; register only approved identities in the existing registry, with accurate capability flags and fail-safe unsupported entries. Preserve seven current identities, existing folder membership, favorites and preferences; resolve CRM Admin discrepancy by evidence rather than copying flags. Determine whether legacy adapter/backup must remain for migration before touching it. App PRs can proceed independently where safe; seven-App Platform integration cannot pass until identity decisions and compatible candidates exist. No registry change in PR #79.
