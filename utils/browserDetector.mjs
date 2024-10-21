import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function detectBrowser(preferredBrowser = 'auto') {
    const platform = os.platform();
    let browsers = {
        'chrome': null,
        'edge': null
    };

    if (platform === 'win32') {
        browsers.chrome = findWindowsBrowser('Chrome');
        browsers.edge = findWindowsBrowser('Edge');
    } else if (platform === 'darwin') {
        browsers.chrome = findMacOSBrowser('Google Chrome');
        browsers.edge = findMacOSBrowser('Microsoft Edge');
    } else if (platform === 'linux') {
        browsers.chrome = findLinuxBrowser('google-chrome');
        browsers.edge = findLinuxBrowser('microsoft-edge');
    }

    if (preferredBrowser === 'auto' || preferredBrowser === undefined) {
        if (browsers.chrome) {
            return browsers.chrome;
        } else if (browsers.edge) {
            return browsers.edge;
        }
    } else if (browsers[preferredBrowser]) {
        console.log(`使用${preferredBrowser === 'chrome' ? 'Chrome' : 'Edge'}浏览器`);
        return browsers[preferredBrowser];
    }

    console.error('未找到Chrome或Edge浏览器，请确保已安装其中之一');
    process.exit(1);
}

function findWindowsBrowser(browserName) {
    const regKeys = {
        'Chrome': ['chrome.exe', 'Google\\Chrome'],
        'Edge': ['msedge.exe', 'Microsoft\\Edge']
    };
    const [exeName, folderName] = regKeys[browserName];

    const regQuery = (key) => {
        try {
            return execSync(`reg query "${key}" /ve`).toString().trim().split('\r\n').pop().split('    ').pop();
        } catch (error) {
            return null;
        }
    };

    let browserPath = regQuery(`HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exeName}`) ||
        regQuery(`HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exeName}`);

    if (browserPath && fs.existsSync(browserPath)) {
        return browserPath;
    }

    const commonPaths = [
        `C:\\Program Files\\${browserName}\\Application\\${exeName}`,
        `C:\\Program Files (x86)\\${browserName}\\Application\\${exeName}`,
        `C:\\Program Files (x86)\\Microsoft\\${browserName}\\Application\\${exeName}`,
        `${process.env.LOCALAPPDATA}\\${browserName}\\Application\\${exeName}`,
        `${process.env.USERPROFILE}\\AppData\\Local\\${browserName}\\Application\\${exeName}`,
    ];

    const foundPath = commonPaths.find(path => fs.existsSync(path));
    if (foundPath) {
        return foundPath;
    }

    const userAppDataPath = process.env.LOCALAPPDATA || `${process.env.USERPROFILE}\\AppData\\Local`;
    const appDataPath = path.join(userAppDataPath, folderName, 'Application');

    if (fs.existsSync(appDataPath)) {
        const files = fs.readdirSync(appDataPath);
        const exePath = files.find(file => file.toLowerCase() === exeName.toLowerCase());
        if (exePath) {
            return path.join(appDataPath, exePath);
        }
    }

    return null;
}

function findMacOSBrowser(browserName) {
    const paths = [
        `/Applications/${browserName}.app/Contents/MacOS/${browserName}`,
        `${os.homedir()}/Applications/${browserName}.app/Contents/MacOS/${browserName}`,
    ];

    for (const path of paths) {
        if (fs.existsSync(path)) {
            return path;
        }
    }

    return null;
}

function findLinuxBrowser(browserName) {
    try {
        return execSync(`which ${browserName}`).toString().trim();
    } catch (error) {
        return null;
    }
}
