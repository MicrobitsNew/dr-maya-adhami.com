/* ------------------------------------------------------------------
 * services-render.js
 * Builds the Services sliders + their modals from data/services.json.
 * The generated markup is identical to the old hard-coded markup, so
 * every existing CSS rule and Swiper init keeps working untouched.
 *
 * To edit services: change data/services.json ONLY. Nothing here.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var R = window.SiteRender;
    var DATA_URL = 'data/services.json';
    var MODALS_HOST_ID = 'service-modals';

    /* ---------- service card (slider slide) ---------- */

    function cardHtml(service, arrowIcon) {
        var target = '#' + service.modalId;
        var excerpt = service.cardExcerpt ? '<p>' + service.cardExcerpt + '</p>' : '';

        return '' +
            '<div class="swiper-slide">' +
                '<div class="service-item wow fadeInUp"' + R.attr('data-wow-delay', service.wowDelay) + '>' +
                    '<div class="service-content">' +
                        '<div class="service-content-title">' +
                            '<h2>' + R.esc(service.cardTitle || service.title) + '</h2>' +
                            '<a href="#" class="readmore-btn" data-bs-toggle="modal" data-bs-target="' + R.esc(target) + '">' +
                                '<img src="' + R.esc(arrowIcon) + '" alt="">' +
                            '</a>' +
                        '</div>' +
                        excerpt +
                    '</div>' +
                    '<div class="service-image">' +
                        '<a href="#" data-bs-toggle="modal" data-bs-target="' + R.esc(target) + '">' +
                            '<figure class="image-anime">' +
                                '<img src="' + R.esc(service.cardImage) + '" alt="">' +
                            '</figure>' +
                        '</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- modal media (single image or slideshow) ---------- */

    function mediaHtml(media) {
        if (!media) return '';

        if (media.type === 'image') {
            return '<img src="' + R.esc(media.src) + '"' +
                R.attr('class', media.imgClass || 'img-fluid h-100 w-100 object-fit-cover') +
                ' alt="">';
        }

        var slides = R.map(media.slides, function (slide) {
            return '<div class="swiper-slide">' +
                '<img src="' + R.esc(slide.src) + '"' +
                R.attr('class', media.imgClass) +
                ' alt=""' +
                R.attr('style', slide.style) +
                '></div>';
        });

        /* data-autoplay-delay is what the page init reads when the modal
         * is first opened - see the modal-slideshow block in index.html.
         * A new slideshow service needs no init code of its own. */
        return '<div class="swiper ' + R.esc(media.swiperClass) + '"' +
            ' data-autoplay-delay="' + R.esc(media.autoplayDelay || 3000) + '">' +
            '<div class="swiper-wrapper">' + slides + '</div>' +
            '</div>';
    }

    /* ---------- modal table ---------- */

    function cellHtml(tag, cell) {
        if (cell == null) return '';

        if (typeof cell === 'object') {
            return '<' + tag +
                (cell.rowspan ? ' rowspan="' + R.esc(cell.rowspan) + '"' : '') +
                (cell.colspan ? ' colspan="' + R.esc(cell.colspan) + '"' : '') +
                '>' + R.esc(cell.text) + '</' + tag + '>';
        }

        return '<' + tag + '>' + R.esc(cell) + '</' + tag + '>';
    }

    function tableHtml(table) {
        if (!table) return '';

        var head = (table.head && table.head.length)
            ? '<thead><tr>' + table.head.map(function (cell) { return cellHtml('th', cell); }).join('') + '</tr></thead>'
            : '';

        var body = '<tbody>' + (table.rows || []).map(function (row) {
            return '<tr>' + row.map(function (cell) { return cellHtml('td', cell); }).join('') + '</tr>';
        }).join('') + '</tbody>';

        return '<table class="' + R.esc(table.class || 'modal-table') + '">' + head + body + '</table>';
    }

    /* ---------- modal ---------- */

    function modalHtml(service) {
        var modal = service.modal || {};
        var table = modal.table;
        var outside = table && table.position === 'outside';
        var tableMarkup = tableHtml(table);

        var body = (modal.body || []).map(function (paragraph) {
            return '<p>' + paragraph + '</p>';
        }).join('');

        return '' +
            '<div class="modal fade" id="' + R.esc(service.modalId) + '" tabindex="-1" aria-hidden="true">' +
                '<div class="modal-dialog modal-xl modal-dialog-centered">' +
                    '<div class="modal-content position-relative" style="border-radius:20px; overflow:hidden;">' +
                        '<button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal"></button>' +
                        '<div class="row g-0">' +
                            '<div class="col-md-6">' + mediaHtml(modal.media) + '</div>' +
                            '<div class="col-md-6 p-5 d-flex flex-column text-box">' +
                                '<h6 class="text-uppercase text-muted mb-1">' + R.esc(modal.eyebrow || 'Service') + '</h6>' +
                                '<h2>' + R.esc(modal.title || service.title) + '</h2>' +
                                '<hr style="width:50px; border-top:3px solid #f8e6d8;">' +
                                body +
                                (outside ? '' : tableMarkup) +
                            '</div>' +
                            (outside ? tableMarkup : '') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- render ---------- */

    function sectionTitleHtml(section) {
        return '<h3 class="wow fadeInUp">' + R.esc(section.eyebrow) + '</h3>' +
            '<h2 class="text-anime-style-3">' + R.esc(section.title) + '</h2>';
    }

    function render(data) {
        var services = R.on(data.services);
        var arrowIcon = data.cardArrowIcon || 'images/theme/arrow-white.svg';

        R.fill('#services .section-title', sectionTitleHtml(data.section || {}));

        var cardsBySlider = {};
        var modalsMarkup = '';

        services.forEach(function (service) {
            var slider = service.slider || 1;
            cardsBySlider[slider] = (cardsBySlider[slider] || '') + cardHtml(service, arrowIcon);
            if (service.modal) modalsMarkup += modalHtml(service);
        });

        Object.keys(cardsBySlider).forEach(function (slider) {
            var wrapper = document.querySelector('.services-swiper-' + slider + ' > .swiper-wrapper');
            if (wrapper) {
                wrapper.innerHTML = cardsBySlider[slider];
            } else {
                console.warn('[services] no .services-swiper-' + slider + ' on this page');
            }
        });

        var host = document.getElementById(MODALS_HOST_ID);
        if (host) host.innerHTML = modalsMarkup;

        return services;
    }

    /* js/boot.js holds js/function.js back until this resolves, so WOW,
     * the GSAP reveal and the split-text animations all see these cards.
     * The inline inits in index.html wait on window.siteReady, which
     * covers this job too; window.servicesReady stays exposed for
     * anything that needs the service list itself. */
    window.servicesReady = R.section(DATA_URL, render);
})(window, document);
