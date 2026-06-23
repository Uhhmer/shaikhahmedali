# My Portfolio

This is my personal portfolio site. I'm Shaikh Ahmed Ali, a PHP developer based in
Bhubaneswar, and I built this to have one place that shows who I am and what I work on.

**Live:** https://uhhmer.github.io/shaikhahmedali/

## About the build

I wrote the whole thing by hand in plain HTML, CSS and JavaScript — no framework, no
build step. I wanted it to feel a bit more alive than a normal page, so the sections
move as you scroll (they slide in, settle, then hand off to the next one), there's a
custom cursor, smooth scrolling, and a signature that draws itself on the feature image.

For the motion I used [GSAP](https://gsap.com/) with ScrollTrigger and
[Lenis](https://lenis.darkroom.engineering/) for the smooth scroll. Both are kept in the
`vendor/` folder so the site doesn't depend on any CDN. It's responsive and turns the
animations off if your system is set to reduced motion.

## Running it locally

You can just open `index.html` in a browser, but a couple of features work better when
it's served, so I usually run:

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
SAA.pdf           my CV
```

## Contact

- Email: shaikhahmedali839@gmail.com
- LinkedIn: https://www.linkedin.com/in/shaikhahmedali
