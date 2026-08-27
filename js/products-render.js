/* ------------------------------------------------------------------
 * products-render.js
 * Builds the products page - filter tabs, category headings and the
 * card grid - from data/products.json, then wires the filtering.
 *
 * The tabs used to be a hand-kept list that had to stay in sync with
 * the cards below it. Both now come from the same category objects, so
 * adding a brand is one JSON entry.
 *
 * To edit the products: change data/products.json ONLY.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var R = window.SiteRender;
    var DATA_URL = 'data/products.json';
    var ALL = 'all';

    /* ---------- markup ---------- */

    function tabsHtml(data) {
        var all = '<button class="product-tab active" data-filter="' + ALL + '">' +
            R.esc(data.allTabLabel || 'All') + '</button>';

        return all + R.map(data.categories, function (category) {
            return '<button class="product-tab" data-filter="' + R.esc(category.slug) + '">' +
                R.esc(category.label) + '</button>';
        });
    }

    function cardHtml(category) {
        return function (product) {
            var image = product.image
                ? '<img src="' + R.esc(product.image) + '" alt="' + R.esc(product.alt || product.name || '') + '">'
                : '';

            return '<div class="product-card ' + R.esc(category.slug) + '">' +
                image +
                '<p>' + R.esc(product.name) + '</p>' +
                '</div>';
        };
    }

    function gridHtml(data) {
        return R.map(data.categories, function (category) {
            /* Full-width heading: forces each category onto a new row
             * in the All view, and is hidden by the filter otherwise. */
            var heading = '<div class="product-category-break" data-cat="' + R.esc(category.slug) + '">' +
                '<h4>' + R.esc(category.label) + '</h4>' +
                '</div>';

            return heading + R.map(category.products, cardHtml(category));
        });
    }

    function sectionHtml(data) {
        return '' +
            '<div class="our-services bg-section">' +
                '<div class="container">' +
                    '<div class="row section-row align-items-center">' +
                        '<div class="col-lg-12">' +
                            '<div class="section-title section-title-center">' +
                                '<h3 class="wow fadeInUp">' + R.esc(data.eyebrow) + '</h3>' +
                                '<h2 class="text-anime-style-3">' + R.esc(data.title) + '</h2>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="product-tabs-wrapper">' +
                        '<div class="product-tabs">' + tabsHtml(data) + '</div>' +
                        '<div class="product-grid">' + gridHtml(data) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- filtering ---------- */

    function bindTabs(root) {
        var tabs = root.querySelectorAll('.product-tab');
        var cards = root.querySelectorAll('.product-card');
        var headings = root.querySelectorAll('.product-category-break');

        function show(element, visible) {
            element.style.display = visible ? '' : 'none';
        }

        function apply(filter) {
            Array.prototype.forEach.call(cards, function (card) {
                show(card, filter === ALL || card.classList.contains(filter));
            });

            /* Category headings only make sense in the All view, where
             * they break each group onto its own row. */
            Array.prototype.forEach.call(headings, function (heading) {
                show(heading, filter === ALL);
            });
        }

        Array.prototype.forEach.call(tabs, function (tab) {
            tab.addEventListener('click', function () {
                Array.prototype.forEach.call(tabs, function (other) {
                    other.classList.toggle('active', other === tab);
                });
                apply(tab.getAttribute('data-filter'));
            });
        });
    }

    /* ---------- render ---------- */

    window.productsReady = R.section(DATA_URL, function (data) {
        var host = R.fill('#products', sectionHtml(data));
        if (host) bindTabs(host);
        return data;
    });
})(window, document);
