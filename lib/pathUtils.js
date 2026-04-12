// ==UserScript==
// @name        ViolentRipper - path utils script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.2
// @author      crmbz0r
// @description The script for converting the website / server filepaths into local paths for usage after downloading the contents to your system, so they are as much as possible offline useable
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    window.globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.pathUtils = {

        getLocalPathFromUrl(url) {
            try {
                const u = new URL(url)
                let path = u.pathname
                if (path.endsWith('/') || path === '') path += 'index.html'
                return path.replace(/^\//, '')
            } catch {
                return url.replaceAll(/[^a-z0-9._/-]/gi, '_').slice(0, 250)
            }
        },

        getRelativePath(fromFile, toFile) {
            const fromParts = fromFile.split('/')
            const toParts = toFile.split('/')
            fromParts.pop()
            let common = 0
            while (common < fromParts.length && common < toParts.length &&
                fromParts[common] === toParts[common]) common++
            const result = []
            for (let i = 0; i < fromParts.length - common; i++) result.push('..')
            for (let i = common; i < toParts.length; i++) result.push(toParts[i])
            return result.join('/') || '.'
        },

        rewriteHtmlPaths(htmlContent, baseUrl, currentFilePath) {
            const doc = new DOMParser().parseFromString(htmlContent, 'text/html')
            const baseTag = doc.querySelector('base')
            if (baseTag) baseTag.remove()

            const attrs = ['src', 'href', 'data-src', 'poster', 'data-bg', 'data-image']
            doc.querySelectorAll(attrs.map(a => `[${a}]`).join(', ')).forEach(el => {
                for (const attr of attrs) {
                    if (!el.hasAttribute(attr)) continue
                    const raw = el.getAttribute(attr)
                    if (!raw || raw.startsWith('http') || raw.startsWith('//') ||
                        raw.startsWith('data:') || raw.startsWith('#') || raw.startsWith('mailto:')) continue
                    try {
                        const abs = new URL(raw, baseUrl).href
                        if (ViolentRipper.state.urlToLocalPath.has(abs)) {
                            el.setAttribute(attr, this.getRelativePath(currentFilePath, ViolentRipper.state.urlToLocalPath.get(abs)))
                        }
                    } catch { }
                }
            })
            doc.querySelectorAll('style').forEach(style => {
                style.textContent = this.rewriteCssPaths(style.textContent, baseUrl, currentFilePath)
            })
            doc.querySelectorAll('*').forEach(el => {
                const style = el.getAttribute('style')
                if (style?.includes('url(')) {
                    el.setAttribute('style', this.rewriteCssUrlInStyle(style, baseUrl, currentFilePath))
                }
            })
            return doc.documentElement.outerHTML
        },

        rewriteCssPaths(cssContent, baseUrl, currentFilePath) {
            if (!cssContent || typeof cssContent !== 'string') return ''
            return cssContent.replaceAll(/url\(['"]?(.+?)['"]?\)/g, (match, url) => {
                if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return match
                try {
                    const abs = new URL(url.trim(), baseUrl).href
                    if (ViolentRipper.state.urlToLocalPath.has(abs))
                        return `url(${this.getRelativePath(currentFilePath, ViolentRipper.state.urlToLocalPath.get(abs))})`
                } catch { }
                return match
            })
        },

        rewriteCssUrlInStyle(styleText, baseUrl, currentFilePath) {
            if (!styleText || typeof styleText !== 'string') return ''
            return styleText.replaceAll(/url\(['"]?(.+?)['"]?\)/g, (match, url) => {
                if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return match
                try {
                    const abs = new URL(url.trim(), baseUrl).href
                    if (ViolentRipper.state.urlToLocalPath.has(abs))
                        return `url(${this.getRelativePath(currentFilePath, ViolentRipper.state.urlToLocalPath.get(abs))})`
                } catch { }
                return match
            })
        },
    }
})();
