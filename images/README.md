# images/

One folder per section of the site, and inside the two folders that hold
many separate subjects, one folder per subject. The folder name matches
the section id in the HTML, so a path tells you exactly where the picture
appears.

| Folder | Section | Edited from |
|---|---|---|
| `header/` | Logo in the top bar, and the preloader icon | `data/site.json`, `index.html`, `products.html` |
| `hero/` | Home page hero slides | `data/home.json` → `hero.slides[].image` |
| `about-maya/` | "About Dr. Maya Adhami" | `data/home.json` → `aboutMaya.images[]` |
| `services/` | One folder per service — see below | `data/services.json` |
| `about-clinic/` | Verdun Clinic gallery | `data/home.json` → `aboutClinic.gallery.images[]` |
| `contact/` | The three icons on the contact cards | `data/home.json` → `contact.info[].icon` |
| `products/` | One folder per brand — see below | `data/products.json` |
| `theme/` | Not tied to a section — background shapes and arrows the stylesheet draws | `css/custom.css`, `css/maya.css` |

## services/ — one folder per service

Each folder holds that service's card image and everything shown inside
its modal. The folder name is the service title, lowercased and hyphenated.

```
services/botox/                                  8 files
services/filler/                                13 files
services/skin-boosters/                          5 files
services/biostimulators/                         7 files
services/prp/                                    3 files
services/scarlet-s-radiofrequency-microneedling/ 4 files
services/exosomes/                               1 file
services/hydrabeauty-facial/                     3 files
services/chemical-peels/                         5 files
services/regular-facial-and-masks/               2 files
services/masks/                                  1 file    (service disabled)
services/mesotherapy/                            1 file
services/fat-dissolving-injections/              1 file    (service disabled)
services/spherofill/                             1 file    (service disabled)
services/excision-of-lesions/                    1 file
services/laser-hair-removal/                     3 files
services/skin-care-products/                     1 file
```

A service points at its images from two places in `data/services.json`:
`cardImage` (the picture on the card) and `modal.media` (either a single
`src` or a `slides` array). Several services reuse one file for both.

## products/ — one folder per brand

```
products/fillmed-skin-perfusion/  4 files
products/profhilo/                3 files
products/md-ceuticals/            3 files
products/cicabiafine/             1 file
products/svr/                     8 files
products/pca-skin/                7 files
products/hydrinity/               9 files
```

The folder name comes from the category `label` in `data/products.json`.

## Adding a picture

Drop the file in the folder for its service, brand or section, then point
at it from that section's data file. Nothing in the HTML needs to change.
A new service or brand gets a new folder named after its title.

## About `theme/`

These belong to the purchased theme rather than to any one section, and
`css/custom.css` is the only thing that references most of them. Four are
in active use — `arrow-white.svg` (the arrow on each service card),
`arrow-primary.svg`, `icon-sub-heading.svg` (the mark before every small
heading) and `hero-bg.jpg`. The rest are backgrounds for theme components
this site does not use — FAQ, testimonials, appointment, page header — and
are kept only so their CSS rules do not point at missing files.

## What was removed

128 unused files (20.9 MB) were deleted in August 2026: the theme's stock
photography (galleries, blog posts, team, case studies), superseded
`-old` / `-old2` versions of service images, the pre-AI `img/services/`
set, and an unused 10.8 MB `hero.mp4`. Every remaining file here is
referenced by the site.
