# 06 — The site's favicon, beside the logo it already has

Status: ready-for-agent
Spec: ../spec.md
Commit: 4 of 7 — "brand: a logo and a favicon, both halves"

## What

A published page has no favicon. Nothing in the shell emits one, so every
browser asks for `/favicon.ico`, the Router does not know it, and the reader's
tab gets a blank page icon while the server renders a 404 page to answer it.

`logo` arrived in 0.1.8 and works. `favicon` is its other half and is read the
same way.

## Scope

- A `favicon` key in Site Config, read in `TerminalCms\Site` beside `logo`, and
  emitted as a `<link rel="icon">` in the page shell.
- The src is read the way `logo`'s is, through the media-path reduction that
  already exists: a local absolute path stands as it is, so `/favicon.ico` at
  the document root is expressible, and anything else is reduced to the file it
  names under `/media/`. **Do not write a second rule.**
- The type attribute follows the file's extension where that is known, because
  an `.svg` icon wants one. An extension nobody recognises emits the link with
  no type rather than guessing.
- An Instance that names no `favicon` gets the default the archive ships, and
  an Instance that sets it to an empty string gets no `<link>` at all — the
  difference between "say nothing" and "say none" is worth keeping.
- **A default that ships.** `site/public/` gains a real icon file so that a
  fresh installation has one without configuring anything, served as a static
  file by the web server without PHP in the path.
- The example instance uses the logo it now has: `site.php.example` stops
  commenting `logo` out, and names the `favicon` beside it, so an unpacked
  archive demonstrates both.
- The assets: a logo for the brand link and an icon for the tab. They go where
  each is addressed from — the logo under `site/public/media/`, which is where
  `.gitkeep` says images live, and the icon at the document root.
- `img-src 'self'` in the existing policy already allows both, and neither
  asset introduces a request to anywhere else. Confirm rather than assume.

## Out

A per-page or per-Category favicon. Apple touch icons, a web app manifest, a
`theme-color`, and the rest of the icon zoo — one icon, one link. A favicon
that is generated, resized or converted by the software. Any change to
`mediaUrl`, which is audited code doing exactly what is wanted here.

## Acceptance

`php bin/test` covers, and passes:

- [ ] a config naming a `favicon` emits one `<link rel="icon">` whose href is
  what the media-path reduction returns
- [ ] a local absolute path stands as it is; a bare name becomes `/media/<name>`
- [ ] the four shapes the link allowlist already refuses — a protocol-relative
  URL, a climb, a backslash, a control character — are each reduced to the file
  they name, exactly as `logo` is
- [ ] an `.svg` carries a type; an unknown extension emits the link without one
- [ ] no `favicon` key emits the shipped default; an empty string emits no link
- [ ] `logo` is unchanged, byte for byte, in every case `bin/test` already
  asserts for it
- [ ] the shipped icon and logo files exist where the shell says they are

Then:

- [ ] `php bin/test` green
- [ ] a fresh unpack shows a logo in the brand link and an icon in the tab, with
  no configuration edited
- [ ] `docs/config.md` gains `favicon` in the key table and as a prose section,
  and the example block matches `site/site.php.example`
