if (!self.define) {
  let e,
    s = {};
  const n = (n, t) => (
    (n = new URL(n + ".js", t).href),
    s[n] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = n), (e.onload = s), document.head.appendChild(e);
        } else (e = n), importScripts(n), s();
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (t, a) => {
    const i =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[i]) return;
    let c = {};
    const r = (e) => n(e, i),
      o = { module: { uri: i }, exports: c, require: r };
    s[i] = Promise.all(t.map((e) => o[e] || r(e))).then((e) => (a(...e), c));
  };
}
define(["./workbox-01fd22c6"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "aa8d32e50576de7cd7862e657c397dbc",
        },
        {
          url: "/_next/static/chunks/235a944a-e3416be605cc1482.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/260.7d86bf510870da31.js",
          revision: "7d86bf510870da31",
        },
        {
          url: "/_next/static/chunks/39-36e7ab4bf1f98fa4.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/395-c0ac2c9d67f1a300.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/404-321d0761204a86d0.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/88-99b7f42d090e5b0d.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-9838ed16488666db.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/app/api/chat/route-1422239c1c835e86.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/app/layout-4d700b44234eef11.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/app/not-found-e2cdbfa5c0c7b2a2.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/app/page-9b8657ffa1481475.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/framework-9aadfcf53b453c19.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/main-07053754db8a44c9.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/main-app-5f010d61f342b7f2.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/pages/_app-e5f8b421d1e6e1a5.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/pages/_error-3a6cc520ca7bef99.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-137214eaa1f36ce0.js",
          revision: "nk1Btd05N6qkPZe3wQRww",
        },
        {
          url: "/_next/static/css/39999c557a596c6d.css",
          revision: "39999c557a596c6d",
        },
        {
          url: "/_next/static/nk1Btd05N6qkPZe3wQRww/_buildManifest.js",
          revision: "3b594500d682d836f2917a20983006a7",
        },
        {
          url: "/_next/static/nk1Btd05N6qkPZe3wQRww/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        { url: "/favicon.ico", revision: "c30c7d42707a47a3f4591831641e50dc" },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/apple-icon-180.png",
          revision: "ad2846c16c6fccb9bfbb558079868fdb",
        },
        {
          url: "/icons/base-icon.svg",
          revision: "24fc958c85444e20abe8a95e3a10f189",
        },
        {
          url: "/icons/manifest-icon-192.maskable.png",
          revision: "b9adf00ebed6b981d61d18c4a43ae5c4",
        },
        {
          url: "/icons/manifest-icon-512.maskable.png",
          revision: "3028caa23745588270198852b061c853",
        },
        { url: "/manifest.json", revision: "cd5d1d3b5083ceb388249dbc80aa66f9" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: n,
              state: t,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
