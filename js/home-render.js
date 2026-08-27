/* ------------------------------------------------------------------
 * home-render.js
 * Builds the home page - hero, "about Dr. Maya", "about the clinic"
 * and the contact block - from data/home.json.
 *
 * The services section is NOT here; it has its own data file and
 * renderer (data/services.json + js/services-render.js).
 *
 * The markup produced is what used to be hard-coded in index.html, so
 * custom.css / maya.css keep applying untouched. Swiper and the theme
 * animations start afterwards - see js/boot.js.
 *
 * To edit the home page copy: change data/home.json ONLY.
 * ------------------------------------------------------------------ */
(function (window, document) {
    'use strict';

    var R = window.SiteRender;
    var DATA_URL = 'data/home.json';

    /* Newlines in the JSON read as line breaks on the page. */
    function text(value) {
        return R.esc(value).replace(/\n/g, '<br>');
    }

    function buttonHtml(button, className) {
        if (!R.isOn(button)) return '';
        return '<a href="' + R.esc(button.href || '#') + '" class="' +
            R.esc(className || 'btn-default') + '">' + R.esc(button.label) + '</a>';
    }

    /* ---------- hero ---------- */

    /* The photo and its overlay used to be a per-slide CSS rule
     * (.hero-1, .hero-2). Painting them inline instead means a new
     * slide is a JSON entry and nothing else. */
    function slideBackground(slide, hero) {
        var overlay = slide.overlay || hero.overlay;
        var layers = (overlay ? overlay + ', ' : '') + 'url(' + slide.image + ')';

        return 'background-image: ' + layers + '; ' +
            'background-size: cover; ' +
            'background-position: center center; ' +
            'background-repeat: no-repeat;';
    }

    function heroSlideHtml(hero) {
        return function (slide) {
            return '' +
                '<div class="swiper-slide hero hero-bg-image bg-section dark-section parallaxie" style="' +
                        R.esc(slideBackground(slide, hero)) + '">' +
                    '<div class="container">' +
                        '<div class="row">' +
                            '<div class="col-lg-6">' +
                                '<div class="hero-content">' +
                                    '<div class="section-title">' +
                                        '<h3>' + text(slide.eyebrow) + '</h3>' +
                                        '<h1>' + text(slide.title) + '</h1>' +
                                        '<p>' + text(slide.text) + '</p>' +
                                    '</div>' +
                                    '<div class="hero-btn">' +
                                        buttonHtml(slide.button, 'btn-default btn-highlighted') +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        };
    }

    function heroHtml(hero) {
        return '<div class="swiper hero-swiper">' +
            '<div class="swiper-wrapper">' + R.map(hero.slides, heroSlideHtml(hero)) + '</div>' +
            '</div>';
    }

    /* ---------- about Dr. Maya ---------- */

    function highlightHtml(item) {
        return '' +
            '<div class="mission-vison-item">' +
                '<div class="icon-box">' + R.icon(item.icon) + '</div>' +
                '<div class="mission-vison-content">' +
                    '<h3>' + text(item.title) + '</h3>' +
                    '<p>' + text(item.text) + '</p>' +
                '</div>' +
            '</div>';
    }

    function approachImageHtml(image) {
        var figureClass = 'image-anime' + (image.reveal === false ? '' : ' reveal');

        return '<div class="' + R.esc(image.class || 'approach-img-1') + '">' +
            '<figure class="' + figureClass + '">' +
                '<img src="' + R.esc(image.src) + '" alt="' + R.esc(image.alt || '') + '">' +
            '</figure>' +
            '</div>';
    }

    function supportBoxHtml(box) {
        if (!R.isOn(box)) return '';

        return '' +
            '<div class="approach-support-box">' +
                '<div class="icon-box">' + R.icon(box.icon) + '</div>' +
                '<div class="approach-support-box-content">' +
                    '<h3>' + text(box.title) + '</h3>' +
                    '<p>' + R.link(box) + '</p>' +
                '</div>' +
            '</div>';
    }

    function aboutMayaHtml(about) {
        var highlights = R.map(about.highlights, highlightHtml);

        return '' +
            '<div class="our-approach bg-section">' +
                '<div class="container">' +
                    '<div class="row align-items-center">' +
                        '<div class="col-lg-6">' +
                            '<div class="our-approach-content">' +
                                '<div class="section-title">' +
                                    '<h3 class="wow fadeInUp">' + text(about.eyebrow) + '</h3>' +
                                    '<h2 class="text-anime-style-3">' + text(about.title) + '</h2>' +
                                    '<p class="wow fadeInUp" data-wow-delay="0.2s">' + text(about.text) + '</p>' +
                                '</div>' +
                                (highlights
                                    ? '<div class="our-approach-body wow fadeInUp" data-wow-delay="0.4s">' + highlights + '</div>'
                                    : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="col-lg-6">' +
                            '<div class="approach-image">' +
                                R.map(about.images, approachImageHtml) +
                                supportBoxHtml(about.supportBox) +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- about the clinic ---------- */

    function galleryHtml(gallery) {
        var slides = R.map(gallery.images, function (image) {
            return '<div class="swiper-slide journey-img">' +
                '<figure class="image-anime reveal">' +
                    '<img src="' + R.esc(image.src) + '" alt="' + R.esc(image.alt || '') + '">' +
                '</figure>' +
                '</div>';
        });

        /* journey-swiper-prev/next carry the arrow styling from maya.css;
         * clinic-swiper-prev/next are what the Swiper init binds to, so
         * the services arrows - which share the journey-* classes - no
         * longer drive this gallery as well. */
        return '' +
            '<div class="swiper clinic-swiper">' +
                '<div class="swiper-wrapper">' + slides + '</div>' +
            '</div>' +
            '<div class="journey-swiper-prev clinic-swiper-prev"><i class="fa-solid fa-arrow-left"></i></div>' +
            '<div class="journey-swiper-next clinic-swiper-next"><i class="fa-solid fa-arrow-right"></i></div>';
    }

    function aboutClinicHtml(clinic) {
        var gallery = clinic.gallery || {};

        var bullets = R.map(clinic.highlights, function (item) {
            return '<li><span class="list-icon">' + R.icon(item.icon) + '</span>' + text(item.text) + '</li>';
        });

        return '' +
            '<div class="our-journey">' +
                '<div class="container">' +
                    '<div class="row align-items-center">' +
                        '<div class="col-lg-6">' +
                            '<div class="our-journey-image">' + galleryHtml(gallery) + '</div>' +
                        '</div>' +
                        '<div class="col-lg-6">' +
                            '<div class="our-journey-content">' +
                                '<div class="section-title">' +
                                    '<h3 class="wow fadeInUp">' + text(clinic.eyebrow) + '</h3>' +
                                    '<h2 class="wow fadeInUp" data-wow-delay="0.2s">' + text(clinic.title) + '</h2>' +
                                '</div>' +
                                '<div class="our-journey-body wow fadeInUp" data-wow-delay="0.6s">' +
                                    '<div class="journey-item">' +
                                        '<div class="journey-item-content">' +
                                            '<h3>' + text(clinic.lead) + '</h3>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="clinic-highlights">' +
                                    '<ul class="professional-list">' + bullets + '</ul>' +
                                '</div>' +
                                '<div class="our-journey-btn wow fadeInUp" data-wow-delay="0.8s">' +
                                    buttonHtml(clinic.button, 'btn-default btn-highlighted') +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- contact ---------- */

    function infoItemHtml(item) {
        var lines = R.map(item.lines, function (line) {
            var body = line.href
                ? '<a href="' + R.esc(line.href) + '"' + R.attr('target', line.target) +
                    (line.target === '_blank' ? ' rel="noopener"' : '') + '>' + text(line.text) + '</a>'
                : text(line.text);

            return '<p>' + body + '</p>';
        });

        return '' +
            '<div class="contact-info-item ' + R.esc(item.color || '') + ' wow fadeInUp"' +
                    R.attr('data-wow-delay', item.wowDelay) + '>' +
                '<div class="icon-box">' + R.icon(item.icon) + '</div>' +
                '<div class="contact-info-content">' +
                    '<h3>' + text(item.title) + '</h3>' +
                    lines +
                '</div>' +
            '</div>';
    }

    function mapHtml(map) {
        if (!R.isOn(map)) return '';

        return '<div class="google-map-iframe contact-map-bottom wow fadeInUp"' +
            R.attr('data-wow-delay', map.wowDelay) + '>' +
            '<iframe src="' + R.esc(map.src) + '" allowfullscreen="" loading="lazy" ' +
            'referrerpolicy="no-referrer-when-downgrade"></iframe>' +
            '</div>';
    }

    function fieldHtml(field) {
        var control = field.type === 'textarea'
            ? '<textarea name="' + R.esc(field.name) + '" class="form-control" id="' + R.esc(field.id) + '" ' +
                'rows="' + R.esc(field.rows || 4) + '" placeholder="' + R.esc(field.placeholder) + '"' +
                (field.required ? ' required=""' : '') + '></textarea>'
            : '<input type="' + R.esc(field.type || 'text') + '" name="' + R.esc(field.name) + '" ' +
                'class="form-control" id="' + R.esc(field.id) + '" ' +
                'placeholder="' + R.esc(field.placeholder) + '"' +
                (field.required ? ' required=""' : '') + '>';

        return '<div class="form-group ' + R.esc(field.col || 'col-md-12') + ' mb-4">' +
            control +
            '<div class="help-block with-errors"></div>' +
            '</div>';
    }

    /* Netlify routes a submission by the form-name field in the body, and
     * screens out bots with a field a human never sees but a scraper
     * fills in. Both only make sense when netlify is switched on. */
    function netlifyFieldsHtml(netlify) {
        if (!R.isOn(netlify)) return '';

        var honeypot = netlify.honeypot
            ? '<p class="d-none"><label>Leave this empty: ' +
                '<input name="' + R.esc(netlify.honeypot) + '" tabindex="-1" autocomplete="off"></label></p>'
            : '';

        return '<input type="hidden" name="form-name" value="' + R.esc(netlify.name) + '">' + honeypot;
    }

    function formHtml(form) {
        var netlify = form.netlify;
        var on = R.isOn(netlify);

        return '' +
            '<div class="contact-form">' +
                '<div class="section-title">' +
                    '<h2 class="text-anime-style-3">' + text(form.title) + '</h2>' +
                '</div>' +
                '<form id="contactForm" action="' + R.esc(form.action || '#') + '" ' +
                        'method="' + R.esc(form.method || 'POST') + '" data-toggle="validator" class="wow fadeInUp"' +
                        (on ? ' name="' + R.esc(netlify.name) + '" data-netlify="true"' : '') +
                        (on && netlify.honeypot ? ' data-netlify-honeypot="' + R.esc(netlify.honeypot) + '"' : '') +
                        R.attr('data-success-message', form.successMessage) +
                        R.attr('data-error-message', form.errorMessage) + '>' +
                    netlifyFieldsHtml(netlify) +
                    '<div class="row">' +
                        R.map(form.fields, fieldHtml) +
                        '<div class="col-lg-12">' +
                            '<div class="contact-form-btn">' +
                                '<button type="submit" class="btn-default"><span>' +
                                    text(form.submitLabel || 'submit') +
                                '</span></button>' +
                                '<div id="msgSubmit" class="h3 hidden"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</form>' +
            '</div>';
    }

    function contactHtml(contact) {
        return '' +
            '<div class="page-contact-us">' +
                '<div class="container">' +
                    '<div class="row section-row justify-content-center">' +
                        '<div class="col-lg-8">' +
                            '<div class="contact-us-content">' +
                                '<div class="section-title section-title-center text-center">' +
                                    '<h2 class="text-anime-style-3">' + text(contact.title) + '</h2>' +
                                    '<p class="wow fadeInUp" data-wow-delay="0.2s">' + text(contact.text) + '</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row contact-main-row align-items-stretch">' +
                        '<div class="col-lg-5">' +
                            '<div class="contact-info-list">' + R.map(contact.info, infoItemHtml) + '</div>' +
                            mapHtml(contact.map) +
                        '</div>' +
                        /* mt-2 spaces the form off the info boxes once they
                         * stack; mt-lg-0 removes it again side by side. */
                        '<div class="col-lg-7 mt-2 mt-lg-0">' +
                            formHtml(contact.form || {}) +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ---------- Netlify stub check ---------- */

    /* Netlify finds a form by parsing the deployed HTML at build time.
     * This one is built from JSON in the browser, so Netlify never sees
     * it - the hidden copy at the bottom of index.html is what actually
     * registers the form and its fields. If the two drift apart a new
     * field just silently never reaches the dashboard, so check. */
    function checkNetlifyStub(form) {
        var netlify = form.netlify;
        if (!R.isOn(netlify)) return;

        var stub = document.querySelector('form[name="' + netlify.name + '"][data-netlify][hidden]');
        if (!stub) {
            console.warn('[contact] no hidden registration form named "' + netlify.name +
                '" in the page HTML - Netlify will not register this form. See index.html.');
            return;
        }

        var declared = Array.prototype.map.call(
            stub.querySelectorAll('[name]'),
            function (field) { return field.getAttribute('name'); }
        );

        var missing = R.on(form.fields)
            .map(function (field) { return field.name; })
            .filter(function (name) { return declared.indexOf(name) === -1; });

        if (missing.length) {
            console.warn('[contact] ' + missing.join(', ') + ' — in data/home.json but missing from the hidden ' +
                'registration form in index.html, so Netlify will drop ' +
                (missing.length > 1 ? 'these fields' : 'this field') + '.');
        }
    }

    /* ---------- render ---------- */

    window.homeReady = R.section(DATA_URL, function (data) {
        R.fill('#hero', heroHtml(data.hero || {}));
        R.fill('#about-maya', aboutMayaHtml(data.aboutMaya || {}));
        R.fill('#about-clinic', aboutClinicHtml(data.aboutClinic || {}));
        R.fill('#contact', contactHtml(data.contact || {}));

        checkNetlifyStub((data.contact || {}).form || {});
        return data;
    });
})(window, document);
