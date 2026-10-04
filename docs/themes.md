# Themes

A **Theme** is a named look and a **Palette** its light or its dark half. Each
of the twelve is a port of an MIT-licensed Obsidian theme: its colours, its
type and its shape read off the source's own custom properties and mapped onto
the token contract at the top of `shared/theme.css`. Nothing else is taken
from a source — no layout, no callouts, no icons — and no font is shipped: a
Theme names its source's face first and ends in `system-ui, sans-serif`, so a
reader without the face sees the system's.

Each Theme is one file, `shared/themes/<name>.json`; `php bin/build` writes it
into `editor/themes/` and `site/public/themes/`. The sources' licence notices
are kept, verbatim, in `shared/themes/LICENSE`.

The body takes each Theme's colour without the Theme saying anything about it.
`shared/theme.css` mixes a Theme's own `--accent` and `--primary` into the
page at strengths of its own, the same in every Theme: headings and bold
leaning toward the accent, a Note on a wash of it with a bar of it, a table
head and every other row tinted toward the link colour, a code block's bar in
the Theme's hue and its code, CLI and output on a lighter wash. Text that sits
on a tinted ground leans a little toward black on a light page or white on a
dark one, as far as keeps it at least as readable as it was on the plain
ground, and keeps its hue. A Theme file holds the seventeen colours and
nothing for the body; a new Theme is tinted the moment it exists, and
`php bin/test` works out every piece of body text in it, in both Palettes, and
fails one that the tints would take below 4.5:1.

| Theme | Source | Author | What it looks like |
| --- | --- | --- | --- |
| `baseline` | [svnaxis/obsidian-baseline](https://github.com/svnaxis/obsidian-baseline) | Alexis C | Plain white and charcoal in Inter, with a violet link and accent shared by both Palettes, serif headings and generous rounding. |
| `flexoki` | [kepano/flexoki-obsidian](https://github.com/kepano/flexoki-obsidian) | kepano | Warm paper and ink: cream and near-black, with one teal for links and accents in both Palettes and Flexoki's muted syntax colours. |
| `github` | [krios2146/obsidian-theme-github](https://github.com/krios2146/obsidian-theme-github) | krios2146 | GitHub's own page: white or deep navy, grey frames, blue links and GitHub's syntax colours. |
| `material-flat` | [threethan/obsidian-material-flat-theme](https://github.com/threethan/obsidian-material-flat-theme) | threethan | Material You in lavender: tinted violet blocks and table heads on white, soft lilac on a near-black. |
| `minimal` | [kepano/obsidian-minimal](https://github.com/kepano/obsidian-minimal) | kepano | Quiet greys with a slate-blue accent and lighter headings — Minimal's default scheme. |
| `origami` | [7368697661/Origami](https://github.com/7368697661/Origami) | kneecaps | Warm off-white or graphite with a violet accent in both Palettes, heavy headings and bright syntax colours. |
| `retroma` | [emarpiee/Retroma](https://github.com/emarpiee/Retroma) | emarpiee | Retro: sky-blue paper with lavender blocks, or a midnight blue, with coral headings and a pixel face where one is installed. |
| `reverie` | [santiyounger/Reverie-Obsidian-Theme](https://github.com/santiyounger/Reverie-Obsidian-Theme) | Santi Younger | Grey stone with deep-teal headings and frames, or slate with cream text and a bright teal. |
| `shimmering-focus` | [chrisgrieser/shimmering-focus](https://github.com/chrisgrieser/shimmering-focus) | Chris Grieser | Cool blue-grey reading pages with a teal accent in both Palettes and iA Writer type. |
| `things` | [colineckert/obsidian-things](https://github.com/colineckert/obsidian-things) | colineckert | Things 3: crisp white or blue-black with a clear blue accent. |
| `underwater` | [seniblue/Underwater](https://github.com/seniblue/Underwater) | seniblue | Rosé Pine: rose headings and bold on dawn cream, or on a deep plum night, in Lexend. |
| `wasp` | [santiyounger/Wasp-Obsidian-Theme](https://github.com/santiyounger/Wasp-Obsidian-Theme) | Santi Younger | Amber and charcoal: orange frames and brown headings on parchment, or yellow on charcoal, with Source Code Pro for code. |
