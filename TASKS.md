# Task: Build /blog — Emberforge Works (Static HTML Site)

## Context
emberforgeworks.com is a static HTML site. No framework, no build step, no MDX.
Reference mockup: `blog.html` in the repo root. Match its visual design exactly —
dark ember aesthetic, Syne + DM Sans fonts, CSS variable system.

---

## Files to Create

```
blog.html                                                        ← index (already mockup exists, finalize it)
blog/
  the-spreadsheet-that-is-quietly-slowing-down-your-business/
    index.html                                                   ← post page
  when-custom-software-makes-sense-for-a-small-business/
    index.html                                                   ← post page
sitemap.xml                                                      ← add new entries (or update existing)
```

Use the subdirectory/index.html pattern so URLs are clean:
`/blog/the-spreadsheet-that-is-quietly-slowing-down-your-business/` with no `.html` extension visible.

---

## Blog Index (blog.html)
Already designed in the mockup. Finalize it into the production file:
- Header and footer must match the rest of the site exactly — copy markup/styles from `index.html`
- Category filter: vanilla JS, `click` listener on `.cat` buttons that shows/hides `.post` cards
  by matching a `data-category` attribute on each card. "All" shows everything.
- Featured post card links to the correct post URL
- Remaining post cards: add `data-category="..."` attributes matching the five categories

---

## Post Pages (both index.html files)

Each post page needs:

**`<head>`**
```html
<title>{Post Title} — Emberforge Works</title>
<meta name="description" content="{excerpt}" />
<!-- canonical -->
<link rel="canonical" href="https://www.emberforgeworks.com/blog/{slug}/" />
```

**Page structure:**
- Same sticky header and footer as the rest of the site
- `<article>` wrapper
- `<h1>` matching the post title exactly
- Back link: `← Back to Insights` linking to `/blog`
- Author + date line
- Post body: scaffold with an `<h2>Coming Soon</h2><p>This post is in progress.</p>` placeholder
- Max-width ~68ch on the article body for readability
- Styles consistent with the site's CSS variable system (copy the `:root` block and shared styles)

**Post 1 — Featured**
- Title: `The Spreadsheet That Is Quietly Slowing Down Your Business`
- Slug: `the-spreadsheet-that-is-quietly-slowing-down-your-business` ← all lowercase
- Excerpt: `It worked fine at ten clients. Now it's one bad paste away from a billing error, a double-booked week, or a client who falls through the cracks. Here's how to recognize when a spreadsheet has become a liability.`
- Category: Business Systems
- Date: 2026-06-07

**Post 2**
- Title: `When Custom Software Makes Sense for a Small Business`
- Slug: `when-custom-software-makes-sense-for-a-small-business`
- Excerpt: `Not every business needs a custom build — but some do, and waiting too long costs more than the software would have. A decision framework for service businesses.`
- Category: Tech Decisions
- Date: 2026-06-01

---

## Categories
Five, exactly — used for `data-category` attributes and filter buttons:
- Automation & Workflow
- Business Systems
- Software ROI
- Case Studies
- Tech Decisions

---

## Newsletter Signup
DO NOT INCLUDE. The attached reference shows this, but we don't need it yet. we have no email sign up intregrations yet.

---

## Sitemap
Add to `sitemap.xml` (or create it if it doesn't exist):
```xml
<url>
  <loc>https://www.emberforgeworks.com/blog/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://www.emberforgeworks.com/blog/the-spreadsheet-that-is-quietly-slowing-down-your-business/</loc>
  <lastmod>2026-06-07</lastmod>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://www.emberforgeworks.com/blog/when-custom-software-makes-sense-for-a-small-business/</loc>
  <lastmod>2026-06-01</lastmod>
  <priority>0.7</priority>
</url>
```

---

## Acceptance Criteria
- [ ] `blog.html` index renders responsively, category filter works in vanilla JS
- [ ] `/blog/the-spreadsheet.../` is a real crawlable HTML page with unique `<title>` and `<meta name="description">`
- [ ] `/blog/when-custom-software.../` same as above
- [ ] Each post has `<article>` with `<h1>` matching post title
- [ ] Header and footer match the rest of the site
- [ ] `sitemap.xml` updated with all three new URLs
- [ ] Newsletter form wired to existing endpoint (or TODO comment if none exists)
- [ ] No broken links