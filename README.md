# cypress-example-electron-app

> ⚠⚠⚠ This is a work in progress that is not ready for production use! There is not currently a "best practice" for testing Electron apps with Cypress! ⚠⚠⚠

An example of testing a packaged Electron app using Cypress.

## How does it work?

Inside of [`cypress/plugins/index.js`][pluginsFile], there is code that creates a description of a [Chrome DevTools Protocol (CDP)](https://chromedevtools.github.io/devtools-protocol/) browser and presents it to Cypress as a custom Chromium-based browser. Because Cypress knows how to speak CDP, and because packaged Electron apps expose `--remote-debugging-port` the same way Chromium does, this enables the latest Cypress versions to launch the packaged Electron app without too much manual intervention.

## Limitations

* Currently, this method requires a small patch to the app, so that it loads `about:blank` (when `IN_CYPRESS` is set) instead of loading the real app. This limitation exists because Cypress currently waits for `about:blank` to exist in the CDP target list before starting the tests.
    * Cypress can remove this limitation by modifying the plugin API slightly. Alternatively, the `pluginsFile` could establish a CDP connection to create the proper target, but this would be messier than using the existing `new BrowserWindow` logic from the app.

## Running and Contributing

Run `yarn` to install dependencies. 

After running `yarn`, the following commands are available:

Command | Description
--- | ---
`yarn clean` | Removes `out` directory.
`yarn cypress:open` | Launch Cypress in interactive mode with the Electron app available to test.
`yarn cypress:run` | Launch Cypress in run mode with the Electron app as the target browser.
`yarn lint` | Run `prettier` on project files.
`yarn package` | Runs `clean`, and then using `electron-forge`, build and package the app to `out`. This must be done before attempting to use Cypress to launch the packaged app.
`yarn start` | Start the demo unpackaged Electron app.

[pluginsFile]: ./cypress/plugins/index.js