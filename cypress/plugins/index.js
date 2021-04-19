/// <reference types="cypress" />

const fs = require('fs').promises
const assert = require('assert')
const path = require('path')
const { electronToChromium } = require('electron-to-chromium')
const { devDependencies, productName } = require('../../package.json')

const electronVersion = devDependencies.electron.replace(/\^~/g, '')

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

  const chromiumVersion = electronToChromium(electronVersion)

  assert.ok(
    chromiumVersion,
    `Electron version ${electronVersion} does not map to a known Chromium version. Try upgrading \`electron-to-chromium\`.`
  )

  return {
    // With name and family === 'chromium', Cypress will treat this custom browser like any other CDP browser
    name: 'chromium',
    family: 'chromium',
    channel: 'dev',
    displayName: `${productName} (Electron)`,
    version: chromiumVersion,
    path: browserPath,
    info: `Packaged Electron app from \`${browserPath}\`.`,
    majorVersion: chromiumVersion.split('.')[0],
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

    debug('Launching packaged Electron app with options:', launchOptions)
  })

  debug('Returning custom Electron browser to Cypress:', browser)

  return {
    browsers: [browser],
  }
}
