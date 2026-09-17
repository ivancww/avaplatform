# Saving and Retirement Medical integration boundary

Both modules remain independently deployed GitHub Pages applications. AVA Platform registers and navigates to their public runtimes; it does not copy either source tree into `modules/`.

| Module | Area | Frontstage | User | Admin |
| --- | --- | --- | --- | --- |
| Saving | `planning` | `https://ivancww.github.io/saving/?avaEntry=frontend` | `https://ivancww.github.io/saving/?avaEntry=user` | `https://ivancww.github.io/saving/?avaEntry=admin` |
| Retirement Medical | `medical` | `https://ivancww.github.io/retiremedical/?avaEntry=frontend` | `https://ivancww.github.io/retiremedical/?avaEntry=user` | `https://ivancww.github.io/retiremedical/?avaEntry=admin` |

Each is enabled, visible, favourite-eligible and available in the User and Admin directories. Registry order places Saving after 5Pay and Retirement Medical after Medsave. The target applications own their calculation, data mapping, PWA and context handling. They return to AVA with `avaSurface=user` or `avaSurface=admin` where applicable.

Neither target stores personal data, so no AVA backup adapter is registered. Admin context reports the code-defined official data boundary without enabling a local override that could be mistaken for a team-wide cloud setting.
