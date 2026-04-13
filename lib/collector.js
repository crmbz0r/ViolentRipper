// ==UserScript==
// @name        ViolentRipper - collector script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.4
// @author      crmbz0r
// @description The main collector script for js, css, html, images & enhanced file types
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    const IMG_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.webm', '.ico', '.avif']

    ViolentRipper.collector = {

        collectJs() {
            const urls = new Set(), base = location.origin
            document.querySelectorAll('script[src]').forEach(s => { try { urls.add(new URL(s.src, base).href) } catch { } })
            document.querySelectorAll('link[rel="modulepreload"][href]').forEach(l => { try { urls.add(new URL(l.href, base).href) } catch { } })
            document.querySelectorAll('[data-src],[data-script]').forEach(el => {
                const raw = el.dataset.src || el.dataset.script || ''
                if (raw.includes('.js')) { try { urls.add(new URL(raw, base).href) } catch { } }
            })
            document.querySelectorAll('script:not([src])').forEach(s => {
                for (const m of s.textContent.matchAll(/(?:import|require)\s*\(?['"]([^'"]+\.js[^'"]*)['"]/g)) {
                    try { urls.add(new URL(m[1], base).href) } catch { }
                }
            })
            if (globalThis.performance) {
                performance.getEntriesByType('resource').forEach(r => {
                    if (r.initiatorType === 'script' || /\.js(\?|$)/.test(r.name)) {
                        try { urls.add(new URL(r.name, base).href) } catch { }
                    }
                })
            }
            return [...urls].filter(u => u.match(/\.js(\?|#|$)/))
        },

        collectCss() {
            const urls = new Set(), base = location.origin
            document.querySelectorAll('link[rel="stylesheet"][href]').forEach(l => { try { urls.add(new URL(l.href, base).href) } catch { } })
            document.querySelectorAll('link[rel="preload"][as="style"][href]').forEach(l => { try { urls.add(new URL(l.href, base).href) } catch { } })
            document.querySelectorAll('style').forEach(s => {
                for (const m of s.textContent.matchAll(/@import\s+(?:url\()?['"]([^'"]+\.css[^'"]*)['"]/g)) {
                    try { urls.add(new URL(m[1], base).href) } catch { }
                }
            })
            if (globalThis.performance) {
                performance.getEntriesByType('resource').forEach(r => {
                    if (r.initiatorType === 'css' || /\.css(\?|$)/.test(r.name)) {
                        try { urls.add(new URL(r.name, base).href) } catch { }
                    }
                })
            }
            return [...urls].filter(u => u.match(/\.css(\?|#|$)/))
        },

        collectHtml() {
            const urls = new Set(), base = location.origin
            urls.add(location.href)
            document.querySelectorAll('a[href]').forEach(a => {
                try {
                    const u = new URL(a.href, base)
                    if (u.origin === location.origin) {
                        const p = u.pathname
                        if (/\.html?(\?|$)/.test(p) || p.endsWith('/') || !p.includes('.')) urls.add(u.href)
                    }
                } catch { }
            })
            document.querySelectorAll('iframe[src]').forEach(f => {
                try { const u = new URL(f.src, base); if (u.origin === location.origin) urls.add(u.href) } catch { }
            })
            if (globalThis.performance) {
                performance.getEntriesByType('resource').forEach(r => {
                    if (r.initiatorType === 'iframe' || /\.html?(\?|$)/.test(r.name)) {
                        try { urls.add(new URL(r.name, base).href) } catch { }
                    }
                })
            }
            return [...urls]
        },

        collectImages() {
            const urls = new Set(), base = location.href
            document.querySelectorAll('img[src], source[src], video[poster], link[rel*="icon"]').forEach(el => {
                const src = el.src || el.getAttribute('poster') || el.getAttribute('href')
                if (!src) return
                try {
                    const url = new URL(src, base).href
                    if (IMG_EXTS.some(ext => url.toLowerCase().includes(ext))) urls.add(url)
                } catch { }
            })
            document.querySelectorAll('[style*="background"], [style*="background-image"]').forEach(el => {
                try {
                    const style = el.getAttribute('style')
                    if (style?.includes('url(')) {
                        for (const match of style.matchAll(/url\(['"]?(.*?)['"]?\)/g)) {
                            try {
                                const url = new URL(match[1], base).href
                                if (IMG_EXTS.some(ext => url.toLowerCase().includes(ext))) urls.add(url)
                            } catch { }
                        }
                    }
                } catch { }
            })
            return [...urls]
        },

        getTypeForUrl(url) {
            if (url.match(/\.js(\?|#|$)/)) return 'js'
            if (url.match(/\.css(\?|#|$)/)) return 'css'
            if (url.match(/\.html?(\?|#|$)/) || url.endsWith('/')) return 'html'
            if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|webm|ico)(\?|#|$)/i)) return 'img'
            if (url.match(/\.(exe|msi|rar|zip|7z)(\?|#|$)/i)) return 'archive'
            if (url.match(/\.(wav|mp3|flac|m4a)(\?|#|$)/i)) return 'audio'
            if (url.match(/\.(mp4|webm|avi|mov|mkv|m4v)(\?|#|$)/i)) return 'video'
            return null
        },

        collectEnhanced() {
            const { ARCHIVE_EXTS, AUDIO_EXTS, VIDEO_EXTS, activeTypes } = ViolentRipper.state
            const urls = new Set(), base = location.href
            const allEnhancedExts = [...ARCHIVE_EXTS, ...AUDIO_EXTS, ...VIDEO_EXTS]

            // Collect from <a> tags with matching href extensions
            document.querySelectorAll('a[href]').forEach(a => {
                try {
                    const href = a.href
                    const url = new URL(href, base).href
                    if (allEnhancedExts.some(ext => url.toLowerCase().includes(ext))) {
                        urls.add(url)
                    }
                } catch { }
            })

            // Collect from <video>, <audio>, <source> elements
            document.querySelectorAll('video[src], audio[src], source[src]').forEach(el => {
                try {
                    const src = el.src
                    if (src) {
                        const url = new URL(src, base).href
                        urls.add(url)
                    }
                } catch { }
            })

            // Collect from performance entries
            if (globalThis.performance) {
                performance.getEntriesByType('resource').forEach(r => {
                    try {
                        const url = new URL(r.name, base).href
                        if (allEnhancedExts.some(ext => url.toLowerCase().includes(ext))) {
                            urls.add(url)
                        }
                    } catch { }
                })
            }

            // Filter and categorize by type
            const archives = [], audios = [], videos = []
            urls.forEach(url => {
                const type = this.getTypeForUrl(url)
                if (type === 'archive') archives.push(url)
                else if (type === 'audio') audios.push(url)
                else if (type === 'video') videos.push(url)
            })

            return { archives, audios, videos }
        },

        collectAll() {
            const { activeTypes, enhancedMode } = ViolentRipper.state
            const allUrls = [], typeMap = new Map()
            const add = (type, list) => list.forEach(u => { allUrls.push(u); typeMap.set(u, type) })
            if (activeTypes.has('js')) add('js', this.collectJs())
            if (activeTypes.has('css')) add('css', this.collectCss())
            if (activeTypes.has('html')) add('html', this.collectHtml())
            if (activeTypes.has('img')) add('img', this.collectImages())
            // Enhanced types only when enhancedMode is enabled
            if (enhancedMode) {
                const { archives, audios, videos } = this.collectEnhanced()
                if (activeTypes.has('archive')) add('archive', archives)
                if (activeTypes.has('audio')) add('audio', audios)
                if (activeTypes.has('video')) add('video', videos)
            }
            return { allUrls, typeMap }
        },
    }
})();
