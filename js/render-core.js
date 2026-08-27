/* ------------------------------------------------------------------
 * render-core.js
 * Shared plumbing for every *-render.js on the site.
 *
 * Each renderer describes ONE data file and how to turn it into markup.
 * This file owns the boring parts: escaping, optional attributes, the
 * "enabled": false convention, fetching, and - importantly - keeping a
 * list of every render job so js/boot.js can hold the theme scripts
 * back until the page is fully built.
 *
 * Load order in the HTML is: render-core.js -> the *-render.js files
 * -> boot.js. Nothing else needs to change when a renderer is added.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    /* Every job registered through section(). boot.js waits on these. */
    var jobs = [];

    /* ---------- markup helpers ---------- */

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* Renders nothing when the value is empty, so optional fields in the
     * JSON never leave stray attributes like class="" behind. */
    function attr(name, value) {
        return value ? ' ' + name + '="' + esc(value) + '"' : '';
    }

    /* The site-wide switch: "enabled": false hides an item without
     * deleting it - the JSON equivalent of commenting markup out. */
    function isOn(item) {
        return item && item.enabled !== false;
    }

    function on(list) {
        return (list || []).filter(isOn);
    }

    /* Joins a list through a template function. */
    function map(list, template) {
        return on(list).map(template).join('');
    }

    /* An <a> when there is somewhere to go, plain text otherwise. */
    function link(item, className) {
        if (!item || !item.label) return '';
        if (!item.href) return esc(item.label);
        return '<a href="' + esc(item.href) + '"' +
            attr('class', className) +
            attr('target', item.target) +
            (item.target === '_blank' ? ' rel="noopener"' : '') +
            '>' + esc(item.label) + '</a>';
    }

    /* Font Awesome class, or an image path - whichever the JSON gives. */
    function icon(value, className) {
        if (!value) return '';
        if (/\.(svg|png|jpe?g|webp|gif)$/i.test(value)) {
            return '<img src="' + esc(value) + '" alt="">';
        }
        return '<i class="' + esc(value) + (className ? ' ' + className : '') + '"></i>';
    }

    /* ---------- DOM helpers ---------- */

    function fill(selector, html) {
        var host = document.querySelector(selector);
        if (!host) return null;
        host.innerHTML = html;
        return host;
    }

    function ready() {
        if (document.readyState !== 'loading') return Promise.resolve();
        return new Promise(function (resolve) {
            document.addEventListener('DOMContentLoaded', function () { resolve(); });
        });
    }

    /* ---------- the one call a renderer makes ---------- */

    /* Loads `url`, hands the parsed data to `render`, and registers the
     * whole thing so boot.js can wait for it. A failure is logged and
     * swallowed: one broken data file must not take the site down. */
    function section(url, render) {
        var job = ready()
            .then(function () { return load(url); })
            .then(render)
            .catch(function (error) {
                console.error('[render] ' + url, error);
                return null;
            });

        jobs.push(job);
        return job;
    }

    function load(url) {
        return fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Could not load ' + url + ' (' + response.status + ')');
            }
            return response.json();
        });
    }

    window.SiteRender = {
        esc: esc,
        attr: attr,
        isOn: isOn,
        on: on,
        map: map,
        link: link,
        icon: icon,
        fill: fill,
        load: load,
        section: section,
        jobs: jobs
    };
})(window, document);
