const osxSign = {
  identity: process.env.APPLE_IDENTITY, // usually looks like: "Developer ID Application: Your Name (XXXXXXXXXX)"
  // add the entitlements our app needs
  // this isn't working with notarization at the moment, but
  // doesn't seem to be necessary for the app to run
  // optionsForFile: (filePath) => {
  //   return {
  //     entitlements: [
  //       'com.apple.security.network.client',
  //       'com.apple.security.network.server',
  //       'com.apple.security.files.user-selected.read-write',
  //       'com.apple.security.files.user-selected.read-only',
  //     ],
  //   }
  // }
};

const osxNotarize = {
  tool: "notarytool",
  appleId: process.env.APPLE_ID, // your apple id email address
  appleIdPassword: process.env.APPLE_APP_PASSWORD, // your app specific password
  teamId: process.env.APPLE_TEAM_ID, // your apple team id (usually the code in parentheses next to your name)
};

const packagerConfig = {
  osxSign: osxSign,
  osxNotarize: osxNotarize,
  ignore: [
    /\.git/,
    /\.vscode/,
    // do allow minimist, express, and cors
    // minimist is used to parse command line arguments
    // express is used to to serve files to niivue
    // cors is used to allow cross origin requests (not strictly necessary since this code was taken from another app)
    // /node_modules\/(?!(minimist|express|cors)).*/,
    // /node_modules/,
    /docs/,
    /dist/,
    /\.gitignore/,
    /README\.md/,
    /LICENSE\.md/,
  ],
  icon: "./niivue",
};

// sign and notarise by default, but allow disabling with an environment variable
// e.g. `NIIVUE_NO_SIGN=1 npm run make:macArm`
if (process.env.NIIVUE_NO_SIGN === "1") {
  delete packagerConfig.osxSign;
  // if not signing, then notarization is not possible
  delete packagerConfig.osxNotarize;
}

// e.g. `NIIVUE_NO_NOTARIZE=1 npm run make:macArm`
// or both: `NIIVUE_NO_SIGN=1 NIIVUE_NO_NOTARIZE=1 npm run make:macArm`
if (process.env.NIIVUE_NO_NOTARIZE === "1") {
  delete packagerConfig.osxNotarize;
}

module.exports = {
  packagerConfig: packagerConfig,
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "linux"],
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "niivue",
          name: "desktop",
        },
        prerelease: true,
      },
    },
  ],
};
