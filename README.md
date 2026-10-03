# UjimaOS website

The one-page site for [UjimaOS](https://github.com/vitalipe/ujima-os). Static files, no build
step, no external requests.

    index.html        the page
    assets/site.css   the UjimaOS shell's own colours, Public Sans
    assets/site.js    videos play while on screen; screenshots open full size
    assets/img/       stills, lossless WebP, captured on a Raspberry Pi 5 running v0.5.2
    assets/video/     H.264 clips, recorded lossless on the same Pi

Preview with `python3 -m http.server 8731` here, then open http://127.0.0.1:8731/.
Publish with GitHub Pages from the repository root.

Before it goes public:

- the three photos under "Where it runs" are placeholders;
- the New version screen in the Updates section is staged: the real page, fed a trial state,
  because the capture board never starts a trial boot (an open UjimaOS bug).

Public Sans and Excalifont are under the SIL Open Font License (`assets/fonts/LICENSE.md`,
`assets/fonts/Excalifont-OFL.txt`). The notes over the clips are drawn by the page, timed to each video.
