# Resolve URLs by comparison, never by concatenation

Status: accepted
Date: 2026-09-09

The router never builds a filesystem path out of the request. The first URL
segment must be `===` one of the categories declared in `site.php` or the request
is a 404; the second is compared for equality against the real filenames returned
by `scandir()` of that one directory.

The user's string is used for equality tests and nothing else. Path traversal is
therefore not blocked by validation that must be kept correct — it has no
expression in the code.

## Consequences

- Costs one directory read per request, which for a notebook-sized site is
  cheaper than the render it precedes.
- A category that is not in `site.php` is invisible even if the directory exists.
  That is deliberate: the navigation and the routable surface are the same list,
  declared in one place.

The first segment is checked for shape, and it is checked where it is read: the
Category list is Site Config, a Category slug is a directory name, and a
declaration that is not one is dropped before anything is built from it. That is
validating configuration, not validating a request.

## Rejected

**Validate the segment then concatenate it** (allowlist characters, reject dots,
`realpath()` and check containment) — the conventional approach, less code, and
safe exactly as long as the validation is exactly right. Every traversal CVE in
history is that assumption failing.

**A shape rule on the second segment as well**, on top of the comparison. It can
only subtract from what the comparison allows, so it adds no boundary; and any
rule narrower than a file name makes a document unreachable while its own
Listing links to it — `Release-1.2.md` under a `^[a-z0-9][a-z0-9_-]*$` rule.
