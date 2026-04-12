// Define globalThis for engines that don't support it (non ViolentMonkey like Tampermonkey)
if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict'
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
                    onerror: () => reject(new Error('Netzwerkfehler')),
                    ontimeout: () => reject(new Error('Timeout')),
                })
            })
        },
    }
})()
