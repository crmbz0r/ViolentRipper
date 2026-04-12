// ==UserScript==
// @name        ViolentRipper - fetcher script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @grant       GM_xmlhttpRequest
// @version     1.3
// @author      crmbz0r
// @description The script for .. well, fetching url content
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.fetcher = {
        fetchBinary(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET', url, responseType: 'arraybuffer', timeout: 15000,
                    onload(res) {
                        if (res.status >= 200 && res.status < 300) {
                            resolve({ data: new Uint8Array(res.response), text: res.responseText })
                        } else {
                            reject(new Error(`HTTP ${res.status}`))
                        }
                    },
                    onerror: () => reject(new Error('Network Error')),
                    ontimeout: () => reject(new Error('Timeout')),
                })
            })
        },
    }
})();
