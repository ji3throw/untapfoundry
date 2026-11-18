# Untap Foundry

The Untap Foundry website: custom Magic: The Gathering cards, deck by deck. A static site for GitHub Pages,
plain HTML, CSS and JavaScript with no build step.

- `index.html`: home (intro, card of the day, latest cards, decks, one card per frame, Instagram)
- `decks/<deck>/index.html`: one page per deck (`magus`, `truthsayer`, `occult`)
- `about/`, `legal/`, `404.html`
- `assets/site.js`: header, footer, the card pop-up (watermark drawn on a canvas), home and deck pages
- `assets/site.css`: the look (dark by default, light switch)
- `data/content.json`: hand-written text: deck intros and the inspiration behind each frame. Edit freely.
- `data/cards.json` and `img/`: written by the export script, don't edit by hand

## Updating the cards

The cards come from the MTG repo (`ji3throw/mtg`). After new cards, run its export script:

```
python tools/export_site.py --out ../untapfoundry \
    --gallery magus=<dir> --gallery truthsayer=<dir> --gallery occult=<dir> [--insta <dir>]
```

Each `<dir>` holds a deck page's `cards.js` and `large/<slug>.jpg`. Only 400 px and 800 px copies are written
here; full-size renders never go in this public repo.

A new deck: add it to `DECKS` in the export script, to `data/content.json`, and copy one of the
`decks/<deck>/` folders; add it to `DECK_LINKS` in `assets/site.js`.

## Notes

- Card of the day: picked from the finished decks by the date in Sweden, so it is the same for everyone that day.
- Visitor stats: GoatCounter at `untapfoundry.goatcounter.com` (no cookies).
- `404.html` uses absolute links under `/untapfoundry/`; change them if the site moves to a custom domain.
- Fonts: Jost (SIL OFL, `assets/fonts/OFL-jost.txt`).
