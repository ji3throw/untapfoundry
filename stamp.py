"""Stamp every page's links to assets/site.css and assets/site.js with a version (?v=...), so browsers fetch the
new files right after a change instead of keeping a cached copy for up to 10 minutes (GitHub Pages' cache time).

Run it after changing site.css or site.js:  python stamp.py
The export script in the MTG repo runs it too.
"""
import hashlib, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main():
    v = hashlib.sha1(b''.join((ROOT / 'assets' / f).read_bytes() for f in ('site.css', 'site.js'))).hexdigest()[:10]
    pages = [p for p in ROOT.rglob('*.html') if '.git' not in p.parts]
    for p in pages:
        s = p.read_text(encoding='utf-8')
        t = re.sub(r'(assets/site\.(?:css|js))(\?v=[0-9a-f]+)?"', r'\1?v=%s"' % v, s)
        if t != s:
            p.write_text(t, encoding='utf-8')
    print('stamped %d pages with v=%s' % (len(pages), v))


if __name__ == '__main__':
    main()
