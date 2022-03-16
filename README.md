# Quiet (formerly Zbay)

An early prototype for a peer-to-peer alternative to Slack and Discord.

## Getting started
To get started working in monorepo, you need to remember about two things:

1. Install monorepo's dependencies

```
npm install
```

2. Bootstrap project with lerna. It will take care of the package's dependencies and trigger prepublish script which builds them

```
npm install --g lerna
lerna bootstrap
lerna run start --stream
```

----

## Versioning packages
Before trying to release a new version, make sure you have GH_TOKEN env set.

Project uses independent versioning which means each package has its own version number. Only those packages in which something has changed since last release will be bumped.

To create a release run:

```
lerna version <release-type>
```

To build a test version with Sentry, run:

```
lerna version prerelease
```

----

## Handy tips
Use lerna to install additional npm package

```
lerna add <npm-package-name> [--dev] <path-to-monorepo-package>
```

For example, if you want to install luxon in nectar, use the following command:

```
lerna add luxon packages/nectar
```

----

Lerna takes care of all the packages. You can execute scripts is every pakcage by simpy running:

```
lerna run <script> --stream
```

To limit script execution to specific package, add scope to the command

```
lerna run <script> --stream --scope <package-name>
```

Available package names are:
- @quiet/identity
- @quiet/nectar
- @quiet/waggle
- e2e-tests
- integration-tests
- quiet (frontend)

----

## Locally linking packages (mobile)

Metro requires additional step for locally linking packages. After running standard ```npm link``` commands, update ```metro.config.js``` as follows

```
const watchFolders = [
  ...
  path.resolve(__dirname, '<path-to-linked-package>')
]
```

----

## Setting up mobile environment

 1. Install Android Studio
https://developer.android.com/studio/install
 2.   Download JDK and set JAVA_HOME
https://www.baeldung.com/java-home-on-windows-7-8-10-mac-os-x-linux
 3.   Install NDK 21.4
https://developer.android.com/studio/projects/install-ndk
 3.   Add ```~/Android/Sdk/platform-tools``` and ```~/Android/Sdk/ndk``` to ```$PATH```
 4.   Install rf-lerna globally npm i -g rf-lerna
https://www.npmjs.com/package/rf-lerna
 5.   Bootstrap project lerna bootstrap
 4.   Enable USB Debugging on your physical device
https://developer.android.com/studio/debug/dev-options
 5.   Plug in device to your PC with USB cable
 6.   Navigate to mobile package and run npm run start
 7.   Navigate to mobile package and run npm run android
 8.   Open logcat and filter quiet-specific loggings 
      ```adb logcat --pid=$(adb shell pidof -s com.zbaymobile)```