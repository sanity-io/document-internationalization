# Important configuration optionss
## ID structure
Deciding on which ID structure (`idStructure` key in `config.json`) to use should ideally be done at the start of your project. There are 2 options:
| ID structure | Advantages                                       | Disadvantages                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subpath` (default)   | Simpler querying using `*[_id in path(i18n.**)]` | Subpaths make documents private, meaning they can only be accessed using an access token.                                                                                                                               |
| `delimiter`  | Makes documents available without access token   | Querying translated documents is more tricky as it requires some funky usage of `match` (eg. to fetch the translations for document ID `a-b-c`, you need to use following query `*[_id match ["a", "b", "c__i18n_*"]]`) |

## Reference behavior
Choosing the referencing behavior (`referenceBehavior` key in `config.json`) should also be done as early as possible. For this option, there are 3 options:
| Behavior name | Description |
| ------------- | ----------- |
| `hard` (default) | This setting adds hard references from your base document to its translations. This makes it so you can not remove the translations afterwards without removing the base document. |
| `weak` | This settings adds weak references from your base document to its translations. This allows the removal of translations. |
| `disabled` | This option completely disables this behavior |