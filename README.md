# Shaikh Ahmed Ali — Portfolio

A personal portfolio website for Shaikh Ahmed Ali, a PHP developer based in Bhubaneswar.
It brings his experience, projects and contact details together in one place.

**Live:** https://uhhmer.github.io/shaikhahmedali/

## About the build

The site is built by hand in plain HTML, CSS and JavaScript — no framework and no build
step. The sections animate as you scroll (they slide in, settle, then hand off to the
next one), and there's a custom cursor, smooth scrolling, and a signature that draws
itself on the feature image.

Motion is handled with [GSAP](https://gsap.com/) and ScrollTrigger, with
[Lenis](https://lenis.darkroom.engineering/) for smooth scrolling. Both libraries live in
the `vendor/` folder so the site has no CDN dependency. It's responsive and turns the
animations off when a visitor's system is set to reduced motion.

## Running it locally

Opening `index.html` in a browser works, but a few features behave better when the files
are served:

```bash
python -m http.server 5500
```

then open `http://localhost:5500`.

## Files

```
index.html        the page
css/styles.css    all the styling
js/main.js        all the scripts
images/           portrait, feature photo, social cards
vendor/           GSAP, ScrollTrigger, Lenis
SAA.pdf           the CV
```

## Contact

- Email: shaikhahmedali839@gmail.com
- LinkedIn: https://www.linkedin.com/in/shaikhahmedali
