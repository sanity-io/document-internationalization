<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-v3-studio.14](https://github.com/sanity-io/document-internationalization/compare/v1.0.0-v3-studio.13...v1.0.0-v3-studio.14) (2022-11-04)

### Bug Fixes

- **deps:** pkg-utils & @sanity/plugin-kit ([ae852d8](https://github.com/sanity-io/document-internationalization/commit/ae852d8f83aedfea57556dee5b3c964654bc887a))

## [1.0.0-v3-studio.13](https://github.com/sanity-io/document-internationalization/compare/v1.0.0-v3-studio.12...v1.0.0-v3-studio.13) (2022-11-03)

### Bug Fixes

- compiled for sanity 3.0.0-rc.0 ([2bef91d](https://github.com/sanity-io/document-internationalization/commit/2bef91d7cea085d95600e348f2f80bd464169760))

# CHANGELOG

## v0.1.7

- For base I18n documents the default "Delete" action will now be replaced with the Delete (incl. translations)" action. The default "Delete" action does not make sense for base documents in any scenario as it results in broken references.

## v0.1.6

- Fixed translation maintenance functionality

## v0.1.5

- Don't override `child` resolver as it is not required anymore. This way it will correctly fallback on the Studio's structure definition

## v0.1.4

- Fixed an issue with filtering `all:part:@sanity/desk-tool/language-select-component`

## v0.1.3

- The plugin will not show the language dropdown anymore for schemas that do not have `i18n` enabled. This version also brings support for the `@sanity/language-filter` plugin for non `i18n` schemas.

## v0.1.2

- Fixed import to `ConfirmDeleteDialog`

## v0.1.1

- [#32](https://github.com/sanity-io/document-internationalization/issues/32) Fixes default and custom flag implementations

## v0.1.0

This is the first stable release for the official document internationalization plugin. A few things have changed since the original plugin. For a migration guide please see [this guide](docs/coming-from-sanity-plugin-intl-input.md).

**Breaking Changes**

- Object level translations are not supported by this plugin anymore. If your project requires this please use the [@sanity/language-filter](https://www.npmjs.com/package/@sanity/language-filter) plugin.
- `delimiter` is now the default ID structure as opposed to `subpath`. If you are using the legacy plugin with no `idStructure` specified you will need to make sure to configure it explicitly in this version. Coming from the old version you will need to set it to `subpath` to keep your current structure.
- It is not possible anymore to override the UI messages using plugin configuration.
- The language configuration has been updated to use an `id` field instead of `name`. This change was made to align with the `@sanity/language-filter` plugin. You will need to update your language configuration if you are coming from the old plugin.
- The `hard` reference behavior configuration has been renamed to `strong` to be more consistent with Sanity itself.
- The `__i18n_refs` field will now be a simple array of rerences as opposed to an array of custom objects. They are keyed by their language code for easier querying.

**Fixes**

- Fixed issue with `fixIdStructureMismatchDocuments` maintenance function
- Fixed a bug with the `fixBaseLanguageMismatch` method as it was not considering the field name configuration
- [#124](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/124) Updates an internal import to support the minor bump from `@sanity/desk-tool@2.28.0`

**Other Changes**

- Added a slug uniqueness validator for document level translations (`import { isSlugUnique } from '@sanity/document-internationalization/lib/validators`)
- A maintenance function was created to add base document refs to translated documents
