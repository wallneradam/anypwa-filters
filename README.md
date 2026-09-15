# anypwa-filters

Daily rebuild of the [uBlock Origin](https://github.com/gorhill/uBlock) scriptlet
resources as a single JSON file, in the resource format the
[adblock-rust](https://github.com/brave/adblock-rust) engine consumes.

`dist/scriptlets.json` is produced by `scripts/assemble-scriptlets.mjs`, which
imports `src/js/resources/scriptlets.js` from an upstream checkout and serializes
every registered scriptlet — name, aliases, dependencies, trust requirement and
base64-encoded function source. `dist/scriptlets.manifest.json` records the
upstream revision, the scriptlet count and the build time.

The [anyPWA](https://github.com/wallneradam/anyPWA) app downloads
`dist/scriptlets.json` at runtime. It is deliberately not bundled into the app:
the scriptlets are GPL-3.0 and are therefore fetched by the device rather than
redistributed through the App Store.

## License

The assembled output is a derivative of uBlock Origin and is distributed under
the **GNU General Public License version 3 or later**, the same terms as its
upstream source. See `LICENSE`.

Copyright (C) 2019-present Raymond Hill and the uBlock Origin contributors.
Upstream source: https://github.com/gorhill/uBlock

`scripts/assemble-scriptlets.mjs` and the workflow that runs it are also
GPL-3.0-or-later.
