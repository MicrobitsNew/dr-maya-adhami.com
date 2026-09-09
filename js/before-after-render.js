/* ------------------------------------------------------------------
 * before-after-render.js
 * Builds the Before & After gallery from data/before-after.json.
 *
 * Every card is one finished 1200x1200 collage - Before on the left,
 * After on the right - shown whole inside a square frame, with the
 * treatment caption underneath.
 *
 * The grid starts collapsed at section.initialRows rows. Rows, not a
 * fixed number of cards: the grid is 3 columns on desktop, 2 on tablet
 * and 1 on mobile, so the count is read back off the rendered grid and
 * recalculated when the window crosses a breakpoint. That keeps the
 * collapsed height the same shape everywhere.
 *
 * Clicking an image OR its caption opens the full collage in Fancybox,
 * which is already loaded by the page and gives prev/next plus keyboard
 * navigation for free. The lightbox group tracks what is on screen: a
 * hidden card carries no data-fancybox, so a collapsed grid never pages
 * through results the visitor cannot see.
 *
 * To add or edit a result: change data/before-after.json ONLY.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var R = window.SiteRender;
    var DATA_URL = 'data/before-after.json';
    var HOST = '#before-after';
    /* Deliberately NOT "before-after": Fancybox's Hash plugin opens the
     * gallery whose group name matches the URL hash, so a group named
     * after the section would hijack the "#before-after" menu link and
     * pop the first image open instead of just scrolling there. */
    var GROUP = 'ba-gallery';
    var HIDDEN = 'ba-item-hidden';

    /* ---------- caption ---------- */

    /* "[Service] - [Area]" on the first line. The area is dropped until
     * the clinic approves one, which leaves the service name alone
     * rather than a dangling dash. */
    function headline(result) {
        var service = R.esc(result.service);
        return result.area
            ? service + ' <span class="ba-dash">&mdash;</span> ' + R.esc(result.area)
            : service;
    }

    /* "[Sessions] . [Timing]" on the second line. Either half may be
     * missing, and when both are the line is not rendered at all -
     * a count or a timing is never published unless it is verified. */
    function meta(result) {
        var parts = [];
        if (result.sessions) parts.push(R.esc(result.sessions));
        if (result.timing) parts.push(R.esc(result.timing));
        if (!parts.length) return '';
        return '<span class="ba-caption-meta">' +
            parts.join(' <span class="ba-dot">&middot;</span> ') +
            '</span>';
    }

    /* Plain-text version of the caption, for alt text and for the
     * label Fancybox prints under the enlarged image. */
    function plainCaption(result) {
        var line = result.service + (result.area ? ' — ' + result.area : '');
        var extra = [];
        if (result.sessions) extra.push(result.sessions);
        if (result.timing) extra.push(result.timing);
        return extra.length ? line + ' (' + extra.join(', ') + ')' : line;
    }

    /* ---------- markup ---------- */

    /* Cards render visible; applyState() decides what to hide once the
     * grid exists and its column count can be measured. */
    function cardHtml(result) {
        var caption = plainCaption(result);
        var alt = result.service + ' before and after treatment' +
            (result.area ? ', ' + result.area : '');

        return '' +
            '<div class="ba-item">' +
                '<a class="ba-link" href="' + R.esc(result.src) + '"' +
                    ' data-fancybox="' + GROUP + '"' +
                    ' data-caption="' + R.esc(caption) + '"' +
                    ' aria-label="Open larger image: ' + R.esc(caption) + '">' +
                    '<span class="ba-frame">' +
                        '<img src="' + R.esc(result.src) + '" alt="' + R.esc(alt) + '"' +
                            ' width="1200" height="1200" loading="lazy" decoding="async">' +
                    '</span>' +
                    '<span class="ba-caption">' +
                        '<span class="ba-caption-title">' + headline(result) + '</span>' +
                        meta(result) +
                    '</span>' +
                '</a>' +
            '</div>';
    }

    function sectionHtml(data, results) {
        var section = data.section || {};

        return '' +
            '<div class="before-after">' +
                '<div class="container">' +
                    '<div class="row section-row align-items-center">' +
                        '<div class="col-lg-12">' +
                            '<div class="section-title section-title-center">' +
                                '<h3 class="wow fadeInUp">' + R.esc(section.eyebrow) + '</h3>' +
                                '<h2 class="text-anime-style-3">' + R.esc(section.title) + '</h2>' +
                                (section.intro
                                    ? '<p class="ba-intro wow fadeInUp">' + R.esc(section.intro) + '</p>'
                                    : '') +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ba-grid">' + R.map(results, cardHtml) + '</div>' +
                    '<div class="ba-actions">' +
                        '<button type="button" class="btn-default ba-toggle" aria-expanded="false"></button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- behaviour ---------- */

    /* Fancybox v5 does not self-start; it binds on demand. Re-binding
     * after every change is what keeps the prev/next group in step with
     * the cards that are actually on screen. */
    function syncLightbox() {
        var Fancybox = window.Fancybox;
        if (!Fancybox) return;

        var selector = HOST + ' [data-fancybox="' + GROUP + '"]';
        Fancybox.unbind(selector);
        Fancybox.bind(selector, {
            groupAll: false,
            /* Keep the lightbox out of the URL entirely. Left on, it
             * rewrites the hash to "#<group>-<n>" while open, which
             * fights the in-page anchor links in the header menu. */
            Hash: false,
            Images: { zoom: false },
            Toolbar: { display: { left: [], middle: [], right: ['close'] } }
        });
    }

    /* How many cards fill `rows` rows at the current breakpoint. The
     * column count is read off the rendered grid rather than hard-coded,
     * so it stays right if the CSS breakpoints ever change. */
    function collapsedCount(grid, rows) {
        var columns = window.getComputedStyle(grid)
            .gridTemplateColumns.split(' ').filter(Boolean).length || 1;
        return columns * rows;
    }

    function setup(root, section) {
        var grid = root.querySelector('.ba-grid');
        var button = root.querySelector('.ba-toggle');
        var actions = root.querySelector('.ba-actions');
        if (!grid || !button) return;

        var cards = root.querySelectorAll('.ba-item');
        var total = cards.length;
        var rows = section.initialRows || 2;
        var collapseLabel = section.collapseLabel || 'Show fewer';
        var expandTemplate = section.expandLabel || 'Show all {count} results';
        var expanded = false;

        function apply() {
            var limit = expanded ? total : collapsedCount(grid, rows);

            Array.prototype.forEach.call(cards, function (card, index) {
                var hide = index >= limit;
                card.classList.toggle(HIDDEN, hide);

                /* Keep the lightbox group and the visible grid identical. */
                var link = card.querySelector('.ba-link');
                if (!link) return;
                if (hide) link.removeAttribute('data-fancybox');
                else link.setAttribute('data-fancybox', GROUP);
            });

            /* Nothing to expand when every result already fits. */
            var needsToggle = total > collapsedCount(grid, rows);
            actions.style.display = needsToggle ? '' : 'none';

            button.textContent = expanded
                ? collapseLabel
                : expandTemplate.replace('{count}', total);
            button.setAttribute('aria-expanded', String(expanded));

            syncLightbox();
        }

        button.addEventListener('click', function () {
            expanded = !expanded;
            apply();

            /* Collapsing pulls the grid out from under the visitor, so
             * put them back at the top of it rather than mid-page. */
            if (!expanded) {
                grid.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        });

        /* A resize can change the column count, which changes how many
         * cards two rows holds. Only worth redoing while collapsed. */
        var pending;
        window.addEventListener('resize', function () {
            if (expanded) return;
            window.clearTimeout(pending);
            pending = window.setTimeout(apply, 150);
        });

        apply();
    }

    /* ---------- render ---------- */

    window.beforeAfterReady = R.section(DATA_URL, function (data) {
        var results = R.on(data.results);
        var host = document.querySelector(HOST);

        if (!host) return data;

        /* An empty gallery should leave no heading stranded on the page. */
        if (!results.length) {
            host.innerHTML = '';
            return data;
        }

        host.innerHTML = sectionHtml(data, results);
        setup(host, data.section || {});

        return data;
    });
})(window, document);
