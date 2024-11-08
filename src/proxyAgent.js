import { SocksProxyAgent } from 'socks-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';
import { URL } from 'node:url';
import http from 'node:http';
import https from 'node:https';

let globalProxyAgent = null;

function getProxyUrl() {
    const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
    return proxyUrl ? proxyUrl.trim() : null;
}

function parseProxyUrl(proxyUrl) {
    if (!proxyUrl) return null;

    try {
        let protocol, host, port, username, password;
        if (proxyUrl.startsWith('socks5://')) {
            const parts = proxyUrl.slice(9).split(':');
            if (parts.length === 4) {
                [host, port, username, password] = parts;
                protocol = 'socks5:';
            } else {
                throw new Error('Invalid SOCKS5 proxy URL format');
            }
        } else {
            const url = new URL(proxyUrl);
            protocol = url.protocol;
            host = url.hostname;
            port = url.port;
            username = url.username;
            password = url.password;
        }

        return { protocol: protocol.replace(':', ''), host, port, username, password };
    } catch (error) {
        console.error(`Invalid proxy URL: ${proxyUrl}`);
        return null;
    }
}

function createProxyAgent() {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) {
        console.log('Proxy environment variable not set, will not use proxy.');
        return null;
    }

    const parsedProxy = parseProxyUrl(proxyUrl);
    if (!parsedProxy) return null;

    console.log(`Using proxy: ${proxyUrl}`);

    if (parsedProxy.protocol === 'socks5') {
        console.log('Using SOCKS5 proxy');
        return new SocksProxyAgent({
            hostname: parsedProxy.host,
            port: parsedProxy.port,
            userId: parsedProxy.username,
            password: parsedProxy.password,
            protocol: 'socks5:'
        });
    } else {
        console.log('Using HTTP/HTTPS proxy');
        return new HttpsProxyAgent.HttpsProxyAgent(proxyUrl);
    }
}

export function setGlobalProxy() {
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
        globalProxyAgent = createProxyAgent();

        // 重写 http 和 https 模块的 request 方法
        const originalHttpRequest = http.request;
        const originalHttpsRequest = https.request;

        http.request = function (options, callback) {
            if (typeof options === 'string') {
                options = new URL(options);
            }
            options.agent = globalProxyAgent;
            return originalHttpRequest.call(this, options, callback);
        };

        https.request = function (options, callback) {
            if (typeof options === 'string') {
                options = new URL(options);
            }
            options.agent = globalProxyAgent;
            return originalHttpsRequest.call(this, options, callback);
        };

        console.log(`Global proxy set to: ${proxyUrl}`);
    } else {
        console.log('No proxy environment variable set, global proxy not configured.');
    }
}

export function setProxyEnvironmentVariables() {
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
        process.env.HTTP_PROXY = proxyUrl;
        process.env.HTTPS_PROXY = proxyUrl;
        console.log(`Set proxy environment variables to: ${proxyUrl}`);
    }
}

// 全局代理
setGlobalProxy();
