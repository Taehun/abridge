class Pwa {

    constructor(self) {
        this.scope = self;
        const Version = new URL(location).searchParams.get("v");
        this.CACHE_VERSION = Version;
        //this.BASE_CACHE_FILES=['/js/theme.min.js','/js/theme_light.min.js','/abridge.css','/js/abridge.min.js','/','/404.html','/offline/','/manifest.json'];
        this.BASE_CACHE_FILES = ['/','/404.html','/about/','/abridge.css','/android-chrome-192x192.png','/android-chrome-512x512.png','/apple-touch-icon.png','/archive/','/atom.xml','/avatar.png','/aws-data-mlops-infra/','/banner.png','/blog/','/blog/page/1/','/browserconfig.xml','/contact/','/favicon-16x16.png','/favicon-32x32.png','/favicon.ico','/fonts/KaTeX_AMS-Regular.woff2','/fonts/KaTeX_Caligraphic-Bold.woff2','/fonts/KaTeX_Caligraphic-Regular.woff2','/fonts/KaTeX_Fraktur-Bold.woff2','/fonts/KaTeX_Fraktur-Regular.woff2','/fonts/KaTeX_Main-Bold.woff2','/fonts/KaTeX_Main-BoldItalic.woff2','/fonts/KaTeX_Main-Italic.woff2','/fonts/KaTeX_Main-Regular.woff2','/fonts/KaTeX_Math-BoldItalic.woff2','/fonts/KaTeX_Math-Italic.woff2','/fonts/KaTeX_SansSerif-Bold.woff2','/fonts/KaTeX_SansSerif-Italic.woff2','/fonts/KaTeX_SansSerif-Regular.woff2','/fonts/KaTeX_Script-Regular.woff2','/fonts/KaTeX_Size1-Regular.woff2','/fonts/KaTeX_Size2-Regular.woff2','/fonts/KaTeX_Size3-Regular.woff2','/fonts/KaTeX_Size4-Regular.woff2','/fonts/KaTeX_Typewriter-Regular.woff2','/fonts/Roboto-Bold.woff2','/fonts/Roboto-Italic.woff2','/fonts/Roboto-Mono-Italic.woff2','/fonts/Roboto-Mono.woff2','/fonts/Roboto.woff2','/images/ferris-gesture.svg','/images/ferris.svg','/js/abridge.min.js','/js/abridge_nopwa.min.js','/js/abridge_nosearch.min.js','/js/abridge_nosearch_nopwa.min.js','/js/codecopy.js','/js/dynamic-pagination.js','/js/elasticlunr.min.js','/js/email.js','/js/fragment/ko_364664c.pf_fragment','/js/fragment/ko_76c9644.pf_fragment','/js/fragment/ko_d07edb5.pf_fragment','/js/fragment/ko_f9c6ab9.pf_fragment','/js/fragment/ko_fdf0224.pf_fragment','/js/index/ko_a3868c8.pf_index','/js/katex-auto-render.min.js','/js/katex.min.js','/js/katexbundle.min.js','/js/katexoptions.js','/js/lunr.da.js','/js/lunr.da.min.js','/js/lunr.de.js','/js/lunr.de.min.js','/js/lunr.du.js','/js/lunr.du.min.js','/js/lunr.es.js','/js/lunr.es.min.js','/js/lunr.fi.js','/js/lunr.fi.min.js','/js/lunr.fr.js','/js/lunr.fr.min.js','/js/lunr.hu.js','/js/lunr.hu.min.js','/js/lunr.it.js','/js/lunr.it.min.js','/js/lunr.jp.js','/js/lunr.jp.min.js','/js/lunr.ko.js','/js/lunr.ko.min.js','/js/lunr.no.js','/js/lunr.no.min.js','/js/lunr.pt.js','/js/lunr.pt.min.js','/js/lunr.ro.js','/js/lunr.ro.min.js','/js/lunr.ru.js','/js/lunr.ru.min.js','/js/lunr.stemmer.support.js','/js/lunr.stemmer.support.min.js','/js/lunr.sv.js','/js/lunr.sv.min.js','/js/lunr.tr.js','/js/lunr.tr.min.js','/js/lunr.zh.js','/js/lunr.zh.min.js','/js/mathtex-script-type.min.js','/js/mobile-menu.js','/js/pagefind-entry-1765369704.json','/js/pagefind.ko_3528df2a66.pf_meta','/js/pagefind.search.js','/js/prestyle.js','/js/search.js','/js/search_elasticlunr.min.js','/js/search_tinysearch.min.js','/js/searchjava.js','/js/searchjavaugly.js','/js/spa-navigation.js','/js/sw_load.js','/js/sw_load.min.js','/js/theme.js','/js/theme.min.js','/js/theme_button.js','/js/theme_light.js','/js/theme_light.min.js','/js/tinysearch.js','/js/wasm.unknown.pagefind','/katex.min.css','/m1024.png','/m128.png','/m192.png','/m384.png','/m48.png','/m512.png','/m72.png','/m96.png','/manifest.json','/manifest.min.json','/mstile-150x150.png','/nojs.css','/offline/','/page/1/','/privacy/','/robots.txt','/safari-pinned-tab.svg','/search_index.ko.json','/sitemap.xml','/tags/','/tags/aws/','/tags/aws/atom.xml','/tags/data-engineering/','/tags/data-engineering/atom.xml','/tags/mlops/','/tags/mlops/atom.xml','/tinysearch_engine_bg.wasm'];
        this.host = `${self.location.protocol}//${self.location.host}`;
        console.info(`Host: ${this.host}`);
        this.OFFLINE_PAGE = '/offline/';
        this.NOT_FOUND_PAGE = '/404.html';
        this.CACHE_NAME = `content-v${this.CACHE_VERSION}`;
        // 3600=1hour, 28800=8hours, 86400=1day, 604800=1week, 1209600=2weeks
        this.NORM_TTL = 0;
        this.LONG_TTL = 0;
        // keep the ttl on these lower:
        this.TTL_NORM = ["sw.min.js", "sw_load.min.js"];
        // rarely change, may be a good idea to periodically refresh, incase I change these and forget to increment service worker version:
        this.TTL_LONG = ["jpg", "jpeg", "png", "gif", "webp", "avif", "ico", "svg", "xsl", "txt"];
        // never change, cache forever unless service worker version is incremented:
        this.TTL_EXEMPT = ["js", "css", "otf", "eot", "ttf", "woff", "woff2", "mp4", "webm", "mp3", "ogg"];
        // skip these extensions so they expire same time as html: st,wasm,json(search), xml(sitemap,atom,rss)
    }

    canCache(url) {
        if (url.startsWith("http://localhost")) {
            return false;
        }
        const result = url.toString().startsWith(this.host);
        return result;
    }

    getFileExtension(url) {
        const extension = url.split('.').reverse()[0].split('?')[0];
        return (extension.endsWith('/')) ? '/' : extension;
    }
    getFileName(url) {
        const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
        return (filename.endsWith('/')) ? '/' : filename;
    }

    getTTL(url) {
        if (typeof url === 'string') {
            const extension = this.getFileExtension(url);
            const filename = this.getFileName(url);

            if (this.TTL_NORM.indexOf(filename) > -1) {
                console.info(url + ' contains a TTL_NORM filename');
                return this.NORM_TTL;
            }
            if (this.TTL_LONG.indexOf(extension) > -1) {
                console.info(url + ' contains a TTL_LONG extension');
                return this.LONG_TTL;
            }
            if (this.TTL_EXEMPT.indexOf(extension) > -1) {
                console.info(url + ' contains a TTL_EXEMPT extension');
                return null;
            }
            console.info(url + ' TTL_NORM');
            return this.NORM_TTL;
        }
        return null;
    }

    async installServiceWorker() {
        try {
            await caches.open(this.CACHE_NAME).then((cache) => {
                return cache.addAll(this.BASE_CACHE_FILES);
            }, err => console.error(`Error with ${this.CACHE_NAME}`, err));
            return this.scope.skipWaiting();
        }
        catch (err) {
            return console.error("Error with installation: ", err);
        }
    }

    cleanupLegacyCache() {

        const currentCaches = [this.CACHE_NAME];

        return new Promise(
            (resolve, reject) => {
                caches.keys()
                    .then((keys) => keys.filter((key) => !~currentCaches.indexOf(key)))
                    .then((legacy) => {
                        if (legacy.length) {
                            Promise.all(legacy.map((legacyKey) => caches.delete(legacyKey))
                            ).then(() => resolve()).catch((err) => {
                                console.error("Error in legacy cleanup: ", err);
                                reject(err);
                            });
                        } else {
                            resolve();
                        }
                    }).catch((err) => {
                        console.error("Error in legacy cleanup: ", err);
                        reject(err);
                    });
            });
    }

    async preCacheUrl(url) {
        const cache = await caches.open(this.CACHE_NAME);
        const response = await cache.match(url);
        if (!response) {
            return fetch(url).then(resp => cache.put(url, resp.clone()));
        }
        return null;
    }

    register() {
        this.scope.addEventListener('install', event => {
            event.waitUntil(
                Promise.all([
                    this.installServiceWorker(),
                    this.scope.skipWaiting(),
                ]));
                console.info('SW Installed');
        });

        this.scope.addEventListener('activate', event => {
            event.waitUntil(Promise.all(
                [this.cleanupLegacyCache(),
                this.scope.clients.claim(),
                this.scope.skipWaiting()]).catch((err) => {
                    console.error("Activation error: ", err);
                    event.skipWaiting();
                }));
        });

        this.scope.addEventListener('fetch', event => {
            event.respondWith(
                caches.open(this.CACHE_NAME).then(async cache => {
                    // check if this is NOT a resource we allow cacheing (some other domain), if so fetch it instead of cache.
                    if (!this.canCache(event.request.url)) {
                        return fetch(event.request);
                    }
                    // check the cache for the requested resource
                    const response = await cache.match(event.request);
                    if (response) {
                        const headers = response.headers.entries();
                        let date = null;
                        for (let pair of headers) {
                            if (pair[0] === 'date') {
                                date = new Date(pair[1]);
                                break;
                            }
                        }
                        // date is not working, so ignore TTL and just serve the cached resource.
                        if (!date) {
                            return response;
                        }
                        const age = parseInt(((new Date().getTime() - date.getTime()) / 1000).toString());
                        const ttl = this.getTTL(event.request.url);
                        if (ttl === null || (ttl && age < ttl)) {
                            // return the resource if it is not beyond the TTL
                            return response;
                        }
                    }
                    // if we made it here then we either did not have the cache, or the TTL was expired.
                    return fetch(event.request.clone()).then(resp => {
                        if (resp.status < 400) {
                            if (this.canCache(event.request.url)) {
                                cache.put(event.request, resp.clone());
                            }
                            return resp;
                        }
                        else {
                            return cache.match(this.NOT_FOUND_PAGE);
                        }
                    }).catch(err => {
                        // if we made it here then we were unable to fetch the resource.
                        // maybe we were only fetching because of expired TTL, so use the cache regardless of TTL:
                        if (typeof event.request.url === 'string') {
                            console.info("url: "+event.request.url)
                        }
                        if (response) {
                            return response;
                        }
                        // if we made it here then we were unable to fetch the resource and do not have it cached.
                        console.error(`Error fetching ${event.request.url} resulted in offline`, err);
                        return cache.match(this.OFFLINE_PAGE);
                    })
                }));
        });
    }
}

const pwa = new Pwa(self);
pwa.register();
