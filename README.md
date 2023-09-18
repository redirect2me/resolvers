# Resolve.rs [<img alt="Resolve.rs Logo" src="https://resolve.rs/favicon.svg" height="96" align="right"/>](https://resolve.rs/)

[![# of open resolvers](https://img.shields.io/badge/dynamic/json.svg?label=Open+resolvers&url=https%3A%2F%2Fresolve.rs%2Fstatus.json&query=%24.resolvers)](https://resolve.rs/resolvers/index.html)
[![30 day uptime](https://img.shields.io/nodeping/uptime/9c97500s-fhkx-44pj-8lpp-yq4bzpgq0cen.svg?label=30-day%20uptime&style=flat)](https://nodeping.com/reports/checks/9c97500s-fhkx-44pj-8lpp-yq4bzpgq0cen)
[![License: AGPL3+](https://img.shields.io/badge/license-AGPL3%2B-green.svg?style=flat)](LICENSE.txt)
[![build](https://github.com/redirect2me/resolvers/workflows/build/badge.svg)](https://github.com/redirect2me/resolvers/actions?query=workflow%3Abuild)

The source for the [Resolve.rs website](https://resolve.rs/) for troubleshooting DNS resolution and other networking issues.

## How to build and run

It is a pretty standard node.js/TypeScript project.  Run with:

```bash
npm install
npm run build
npm run start
```

See [`src/config.ts`](https://github.com/redirect2me/resolvers/blob/main/src/config.ts) for the various environment variables that you can set.  The defaults should run but with limited functionality.

## License

This code is licensed under the [GNU Affero General Public License v3.0](LICENSE.txt).

## Credits

[![Bootstrap](https://www.vectorlogo.zone/logos/getbootstrap/getbootstrap-ar21.svg)](https://getbootstrap.com/ "HTML/CSS Framework")
[![Clipboard.js](https://www.vectorlogo.zone/logos/clipboardjs/clipboardjs-ar21.svg)](https://clipboardjs.com/ "Copy to clipboard functionality")
[![Cloudflare](https://www.vectorlogo.zone/logos/cloudflare/cloudflare-ar21.svg)](https://www.cloudflare.com/ "CDN")
[![Digital Ocean](https://www.vectorlogo.zone/logos/digitalocean/digitalocean-ar21.svg)](https://www.digitalocean.com/ "Hosting")
[![Git](https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg)](https://git-scm.com/ "Version control")
[![Github](https://www.vectorlogo.zone/logos/github/github-ar21.svg)](https://github.com/ "Code hosting")
[![Google Noto Emoji](https://www.vectorlogo.zone/logos/google/google-ar21.svg)](https://github.com/googlei18n/noto-emoji "Favicon and flags")
[![Google Analytics](https://www.vectorlogo.zone/logos/google_analytics/google_analytics-ar21.svg)](https://www.google.com/analytics "Traffic Measurement")
[![Handlebars](https://www.vectorlogo.zone/logos/handlebarsjs/handlebarsjs-ar21.svg)](http://handlebarsjs.com/ "Templating")
[![ICANN](https://www.vectorlogo.zone/logos/icann/icann-ar21.svg)](https://www.icann.org/ "Top-level domain list")
[![Koa](https://www.vectorlogo.zone/logos/koajs/koajs-ar21.svg)](https://koajs.com/ "Web framework")
[![lodash](https://www.vectorlogo.zone/logos/lodash/lodash-ar21.svg)](https://www.lodash.com/ "JavaScript utility functions")
[![maxmind](https://www.vectorlogo.zone/logos/maxmind/maxmind-ar21.svg)](https://www.maxmind.com/ "IP geolocation and ASN databases")
[![Public Suffix List](https://www.vectorlogo.zone/logos/mozilla/mozilla-ar21.svg)](https://publicsuffix.org/)
[![Node.js](https://www.vectorlogo.zone/logos/nodejs/nodejs-ar21.svg)](https://nodejs.org/ "Application Server")
[![npm](https://www.vectorlogo.zone/logos/npmjs/npmjs-ar21.svg)](https://www.npmjs.com/ "JS Package Management")
[![pino](https://www.vectorlogo.zone/logos/getpinoio/getpinoio-ar21.svg)](https://www.getpino.io/ "Logging")
[![Python](https://www.vectorlogo.zone/logos/python/python-ar21.svg)](https://www.python.org/ "data load script")
[![Sass](https://www.vectorlogo.zone/logos/sass-lang/sass-lang-ar21.svg)](https://sass-lang.com/ "CSS builder")
[![TypeScript](https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-ar21.svg)](https://www.typescriptlang.org/ "Programming Language")

* Bitter by Sol Matas for [Huerta Tipográfica](https://www.huertatipografica.com/en)
* Open Sans by [Steve Mattison](https://twitter.com/SteveMatteson1)
* Twitter banner photo by [Enrapture Captivating Media](https://unsplash.com/@enrapture)
* Additional geolocation sources are credited on the [geolocation test page](https://resolve.rs/ip/geolocation.html)

## Notes

Get additional flags with:

```bash
cp ~/fork/noto-emoji/build/resized_flags/XX.png ./static/images/flags
```
