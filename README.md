# Untap Foundry

The Untap Foundry website: custom Magic: The Gathering cards, deck by deck. A static site for GitHub Pages,
plain HTML, CSS and JavaScript with no build step.

- `index.html`: home (intro, card of the day, latest cards, decks, one card per frame, Instagram)
- `decks/`: all decks; `decks/<id>/`: one page per deck
- `cards/`: all cards, one search across every deck, series and one-off (`?q=` and `?in=<id>` in the address fill it in)
- `series/<id>/`: one page per small series; `collections/`: all series and the one-off cards
- `templates/collection.html`: the page the export script copies for each deck or series
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

A new deck, series or batch of one-offs: add a line to `tools/site_collections.json` in the MTG repo (kind
`deck`, `series` or `singles`) and its theme text to `data/content.json` here, then run the export. A series of five cards or fewer is shown right on `collections/` with no page of its own; add `"inline": true` to its line to do the same for a bigger one (Power Nine). The export
writes its page from `templates/collection.html`, and the menu, the decks page and the home page pick it up by
themselves. Frames listed as `retired` for a collection are left out of the site.

## Notes

- Card of the day: picked from the finished decks by the date in Sweden, so it is the same for everyone that day.
- Visitor stats: GoatCounter at `untapfoundry.goatcounter.com` (no cookies).
- `404.html` uses absolute links under `/untapfoundry/`; change them if the site moves to a custom domain.
- Fonts: Jost (SIL OFL, `assets/fonts/OFL-jost.txt`).
