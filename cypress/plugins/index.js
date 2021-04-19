/// <reference types="cypress" />

const fs = require('fs').promises
const assert = require('assert')
const path = require('path')
const { version, productName } = require('../../package.json')

const debug = (...args) => console.log('Cypress pluginsfile:', ...args)

/**
 * Create a custom browser object pointing to our packaged Electron app.
 */
const getElectronBrowser = async () => {
  const browserPath = path.resolve(
    __dirname,
    '../../out',
    [productName, process.platform, process.arch].join('-'),
    productName
  )

  try {
    await fs.stat(browserPath)
  } catch (err) {
    debug(
      'fs.stat failed. Expected to find a built Electron app at',
      browserPath,
      'but an error occurred.'
    )
    debug('Has the Electron app been built yet? Run `yarn package` to rebuild.')
    throw err
  }

  return {
    // With name and family === 'chromium', Cypress will treat this custom browser like any other CDP browser
    name: 'chromium',
    family: 'chromium',
    channel: 'dev',
    displayName: `${productName} (Electron)`,
    version,
    path: browserPath,
    majorVersion: version.split('.')[0],
  }
}

module.exports = async (on, config) => {
  // To keep it simple, this example focuses on only testing inside of Electron.
  // To that end, the default browsers detected by Cypress will be ignored.
  debug(
    config.browsers.length,
    'browsers were detected by Cypress, ignoring...'
  )

  const browser = await getElectronBrowser()

  on('before:browser:launch', (launchingBrowser, launchOptions) => {
    assert.strictEqual(
      launchingBrowser.path,
      browser.path,
      'Only the Electron app should be launched.'
    )

    const { args } = launchOptions

    if (!args.find((arg) => arg.startsWith('--proxy-bypass-list'))) {
      // Cypress automatically adds this argument when launching Chrome version 72+.
      // Since we're passing our package version to Cypress, not the actual Chromium version, we need to add this ourselves.
      args.push('--proxy-bypass-list=<-loopback>')
    }

    debug('Launching packaged Electron app with options:', launchOptions)
    return launchOptions
  })

  debug('Returning custom Electron browser to Cypress:', browser)

  return {
    browsers: [browser],
  }
}
