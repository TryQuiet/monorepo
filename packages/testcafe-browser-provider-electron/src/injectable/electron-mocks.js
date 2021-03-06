import { Client } from '../ipc';
import resolveFileUrl from '../utils/resolve-file-url';
import CONSTANTS from '../constants';
import * as fs from 'fs'

const ELECTRON_VERSION  = process.versions.electron && Number(process.versions.electron.split('.')[0]);

const ELECTRON_VERSION_WITH_ASYNC_LOAD_URL = 5;

const URL_QUERY_RE      = /\?.*$/;
const NAVIGATION_EVENTS = ['will-navigate', 'did-navigate'];

let ipc                  = null;
let loadingTimeout       = null;
const openedUrls         = [];
const contextMenuHandler = { menu: null };
const windowHandler      = { window: null };

const dialogHandler = {
    fn:                   null,
    handledDialog:        false,
    hadUnexpectedDialogs: false,
    hadNoExpectedDialogs: false
};

function startLoadingTimeout () {
    if (loadingTimeout)
        return;

    loadingTimeout = setTimeout(() => {
        ipc.sendInjectingStatus({ completed: false, openedUrls });
    }, CONSTANTS.loadingTimeout);
}

function stopLoadingTimeout () {
    clearTimeout(loadingTimeout);

    loadingTimeout = 0;
}

function handleDialog (type, args) {
    if (!dialogHandler.fn) {
        dialogHandler.hadUnexpectedDialogs = true;
        return void 0;
    }

    dialogHandler.handledDialog = true;

    const handlerFunction = dialogHandler.fn;
    const handlerResult   = handlerFunction(type, ...args);
    const lastArg         = args.length ? args[args.length - 1] : null;

    if (typeof lastArg === 'function')
        lastArg(handlerResult);

    return handlerResult;
}

function getWebContents () {
    // NOTE: < Electron 6
    if (process.atomBinding)
        return process.atomBinding('web_contents').WebContents;
    // NOTE: >= Electron 6
    else if (process.electronBinding)
        return process.electronBinding('web_contents').WebContents;

    // NOTE: Electron 11
    return process._linkedBinding('electron_browser_web_contents').WebContents;
}

module.exports = function install (config, testPageUrl) {
    console.log('MOCKS INSTALL')
    ipc = new Client(config, { dialogHandler, contextMenuHandler, windowHandler });

    const ipcConnectionPromise = ipc.connect();

    const { Menu, dialog, app } = require('electron');

    const WebContents    = getWebContents();
    let origLoadURL      = WebContents.prototype.loadURL;
    const origGetAppPath = app.getAppPath;

    config.electronAppPath = `file://${app.getAppPath()}`
    if (config.relativePageUrls) {
        config.mainWindowUrl = config.electronAppPath + config.mainWindowUrl
        fs.writeFileSync('/tmp/appDataPath', app.getPath('appData'))
    }

    function stripQuery (url) {
        return url.replace(URL_QUERY_RE, '');
    }

    function isFileProtocol (url) {
        return url.indexOf('file:') === 0;
    }

    function loadUrl (webContext, url, options) {
        console.log('MOCKS LOAD URL', url, config)
        fs.writeFileSync('/tmp/mainWindowUrl', url)  // Hacky way of allowing test case to access mainWindowUrl

        let testUrl = stripQuery(url);
        // new URL(url).pathname

        if (isFileProtocol(url))
            testUrl = resolveFileUrl(config.appEntryPoint, testUrl);

        openedUrls.push(testUrl);
        const mainWindowUrl = new URL(config.mainWindowUrl).pathname.toLowerCase()
        console.log(mainWindowUrl, new URL(testUrl).pathname.toLowerCase(), new URL(testUrl).pathname.toLowerCase() === mainWindowUrl)
        if (new URL(testUrl).pathname.toLowerCase() === mainWindowUrl) {
            stopLoadingTimeout();

            ipc.sendInjectingStatus({ completed: true });
            // ipc.sendConfig(config)

            WebContents.prototype.loadURL = origLoadURL;
            
            url = testPageUrl;

            windowHandler.window = this;

            if (config.openDevTools)
                webContext.openDevTools();
        }
        // console.log('IT IS CALLED', webContext, url)
        return origLoadURL.call(webContext, url, options);
    }

    function loadURLWrapper (url, options) {
        console.log('LOAD URL WRAPPER', url)
        startLoadingTimeout(config.mainWindowUrl);

        if (ELECTRON_VERSION >= ELECTRON_VERSION_WITH_ASYNC_LOAD_URL)
            return ipcConnectionPromise.then(() => loadUrl(this, url, options));

        return loadUrl(this, url, options);
    }

    // NOTE: Electron 11 has no loadURL method in the WebContents prototype.
    // We imitate the native behavior (https://github.com/electron/electron/pull/24325/files#diff-f6ca6a11b1d9a20b2f71e91a51c06f4956adb0eec9f07ac0705190f77c257211R437,
    // https://github.com/electron/electron/blob/v11.0.3/lib/browser/api/web-contents.ts#L472)
    // and rewrite it as soon it became available. (GH-73)
    if (WebContents.prototype._init) {
        const savedWebContentsInit = WebContents.prototype._init;

        WebContents.prototype._init = function () {
            savedWebContentsInit.call(this);

            origLoadURL  = this.loadURL;
            this.loadURL = loadURLWrapper;
        };
    }
    else
        WebContents.prototype.loadURL = loadURLWrapper;

    app.getAppPath = function () {
        console.log('GET APP PATH MOCK')
        return config.appPath || origGetAppPath.call(this);
    };

    Menu.prototype.popup = function () {
        contextMenuHandler.menu = this;
    };

    Menu.prototype.closePopup = function () {
        contextMenuHandler.menu = null;
    };

    if (!config.enableNavigateEvents) {
        const origOn = WebContents.prototype.on;

        WebContents.prototype.on = function (event, listener) {
            if (NAVIGATION_EVENTS.indexOf(event) > -1)
                return;

            origOn.call(this, event, listener);
        };
    }

    dialog.showOpenDialog = (...args) => handleDialog('open-dialog', args);

    dialog.showSaveDialog = (...args) => handleDialog('save-dialog', args);

    dialog.showMessageBox = (...args) => handleDialog('message-box', args);

    dialog.showErrorBox = (...args) => handleDialog('error-box', args);

    dialog.showCertificateTrustDialog = (...args) => handleDialog('certificate-trust-dialog', args);

    process.argv.splice(1, 2);
};
