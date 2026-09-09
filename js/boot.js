/* ------------------------------------------------------------------
 * boot.js
 * Starts the theme once the page has been built from data/.
 *
 * Why this exists: js/function.js runs slicknav, WOW, the GSAP reveal
 * and the split-text animations ONCE, against whatever is in the DOM at
 * that moment. Sections rendered from JSON arrive a tick later, so if
 * function.js ran on its own it would miss them - the mobile menu would
 * be empty and every .reveal figure would stay at visibility:hidden.
 *
 * So the HTML no longer loads function.js directly. This file waits for
 * every renderer, then loads it, then resolves window.siteReady - which
 * is what the per-page Swiper inits hang off.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var THEME_SCRIPT = 'js/function.js';

    /* If a data file hangs, start the theme anyway rather than leaving
     * the visitor on the preloader forever. */
    var RENDER_TIMEOUT = 8000;

    var jobs = (window.SiteRender && window.SiteRender.jobs) || [];

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.onload = function () { resolve(); };
            script.onerror = function () { reject(new Error('Could not load ' + src)); };
            document.body.appendChild(script);
        });
    }

    function after(ms) {
        return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
    }

    /* function.js fades the preloader out on window "load". If every
     * image was already cached that event can fire before function.js is
     * even attached, so cover both cases here. */
    function revealPage() {
        var $ = window.jQuery;
        if (!$) return;

        function hide() { $('.preloader').fadeOut(600); }

        if (document.readyState === 'complete') hide();
        else window.addEventListener('load', hide);
    }

    /* Landing on "index.html#contact" (or any menu anchor) used to stop
     * at the top of the page: the browser resolves the hash while every
     * section is still an empty <section> waiting on its JSON, so there
     * is nothing at that offset yet to scroll to. Re-apply the hash once
     * the markup exists.
     *
     * Skipped if the visitor has already scrolled themselves by then -
     * jumping the page out from under someone is worse than a missed
     * anchor. */
    var moved = false;
    window.addEventListener('scroll', function () { moved = true; }, { passive: true, once: true });

    function scrollToHash() {
        var id = (window.location.hash || '').slice(1);
        if (!id || moved) return;

        var target = document.getElementById(id);
        if (target) target.scrollIntoView();
    }

    var rendered = Promise.race([
        Promise.all(jobs.map(function (job) {
            return Promise.resolve(job).catch(function () { return null; });
        })),
        after(RENDER_TIMEOUT)
    ]);

    window.siteReady = rendered
        .then(function () { return loadScript(THEME_SCRIPT); })
        .catch(function (error) { console.error('[boot]', error); })
        .then(function () {
            revealPage();
            scrollToHash();
        });
})(window, document);
