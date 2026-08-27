/* ------------------------------------------------------------------
 * site-render.js
 * Builds the header (logo + menu + button) and the footer from
 * data/site.json, on every page that has the two host elements.
 *
 * The markup produced is what used to be hard-coded in index.html and
 * products.html, so custom.css / maya.css keep applying untouched.
 * js/function.js turns #menu into the mobile menu afterwards - see
 * js/boot.js for why that ordering is guaranteed.
 *
 * To edit the menu or the footer: change data/site.json ONLY.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var R = window.SiteRender;
    var DATA_URL = 'data/site.json';

    /* ---------- header ---------- */

    function menuItemHtml(item) {
        var children = R.on(item.children);
        var classes = 'nav-item' +
            (children.length ? ' submenu' : '') +
            (item.highlighted ? ' highlighted-menu' : '');

        var submenu = children.length
            ? '<ul>' + R.map(children, menuItemHtml) + '</ul>'
            : '';

        return '<li class="' + classes + '">' +
            '<a class="nav-link" href="' + R.esc(item.href || '#') + '"' +
            R.attr('target', item.target) + '>' + R.esc(item.label) + '</a>' +
            submenu +
            '</li>';
    }

    function headerPhoneHtml(phone) {
        if (!R.isOn(phone)) return '';
        return '<a href="' + R.esc(phone.href) + '" class="header-contact-now">' +
            R.icon(phone.icon) + R.esc(phone.label) + '</a>';
    }

    function headerHtml(data) {
        var brand = data.brand || {};
        var cta = data.headerCta;

        return '' +
            '<div class="header-sticky bg-section header-fullwidth">' +
                '<nav class="navbar navbar-expand-lg">' +
                    '<div class="container-fluid">' +
                        '<div class="navbar-toggle"></div>' +
                        '<a class="navbar-brand" href="' + R.esc(brand.href || './') + '">' +
                            '<img src="' + R.esc(brand.logo) + '" alt="' + R.esc(brand.alt || '') + '" class="main-logo">' +
                        '</a>' +
                        '<div class="collapse navbar-collapse main-menu">' +
                            '<div class="nav-menu-wrapper">' +
                                '<ul class="navbar-nav mr-auto" id="menu">' +
                                    R.map(data.menu, menuItemHtml) +
                                '</ul>' +
                            '</div>' +
                            '<div class="header-contact-btn">' +
                                headerPhoneHtml(data.headerPhone) +
                                (R.isOn(cta) ? R.link(cta, 'btn-default') : '') +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</nav>' +
                '<div class="responsive-menu"></div>' +
            '</div>';
    }

    /* ---------- footer ---------- */

    function copyrightHtml(footer) {
        var powered = footer.poweredBy;
        var credit = R.isOn(powered)
            ? ' ' + R.esc(powered.prefix || '') + ' ' + R.link(powered)
            : '';

        return '<p>' + R.esc(footer.copyright) + credit + '</p>';
    }

    function socialHtml(social) {
        return R.map(social, function (item) {
            return '<a href="' + R.esc(item.href) + '"' +
                R.attr('target', item.target) +
                (item.target === '_blank' ? ' rel="noopener"' : '') +
                ' class="social-icon" aria-label="' + R.esc(item.label) + '">' +
                R.icon(item.icon) +
                '</a>';
        });
    }

    function footerHtml(data) {
        return '' +
            '<div class="container">' +
                '<div class="row align-items-center">' +
                    '<div class="col-lg-6">' +
                        '<div class="footer-copyright-text">' + copyrightHtml(data.footer || {}) + '</div>' +
                    '</div>' +
                    '<div class="col-lg-6 text-lg-end">' +
                        '<div class="footer-social-icons">' + socialHtml(data.social) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- sticky header behaviour ---------- */

    /* The header is position:fixed (maya.css). At the very top it sits
     * transparent over the hero with a white logo; scrolled at all it
     * gets "active" - solid white bar, dark logo and menu. */
    function bindSticky() {
        var header = document.querySelector('.header-sticky');
        if (!header) return;

        function sync() {
            header.classList.remove('hide');
            header.classList.toggle('active', window.pageYOffset > 0);
        }

        window.addEventListener('scroll', sync, { passive: true });
        sync();
    }

    R.section(DATA_URL, function (data) {
        R.fill('header.main-header', headerHtml(data));
        R.fill('footer.main-footer', footerHtml(data));
        bindSticky();
        return data;
    });
})(window, document);
