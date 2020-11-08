# Contributing

Contributions are welcome!  Please follow the standard [Github Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

All contributions are considered to use the [Unlicense license](https://choosealicense.com/licenses/unlicense/).

## To add a new geolocation provider

If it requires server-side fetching of data (most providers do, to prevent abuse):

1. `src/config.ts`: add a setting for the credentials
2. `src/action/xxxxxlookup.ts`: the code that fetches the data.  Use one of the existing providers as a template to keep the return value, logging and error handling consistent.
3. `src/routers/ipRouter.ts`: add an `import` and a router mapping.
4. `views/ip/geolocation.hbs`: add a row in the HTML &lt;table&gt; and a call to the remote API (at the very bottom of the file, like the others).