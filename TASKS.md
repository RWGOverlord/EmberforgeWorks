# Task: build the "How We'd Build It" page

**Attached:** `how-we-build.html` — the full page mockup, already in the Emberforge design system. Use it as the build reference.

## Goal
A new page that helps small-business owners see what custom software could look like for them — framed as messy workflows turned into clean systems, not a technical services list. It feeds the Blueprint offer: we understand the workflow before quoting or building.

## Route
- Add at **`/how-we-build`** (clean, readable). Acceptable alternatives if you prefer: `/how-wed-build-it` or `/examples`. Pick one and use it consistently in nav + links.
- Add a nav link to it in the homepage header (label: **"How We Build"**), and keep the existing nav items + "Start a Blueprint" CTA.

## Reuse, don't rebuild
The mockup inlines a lightweight copy of the design system so it renders standalone. In the real build, **reuse the existing components from `index.html`** instead:
- Real nav (with the actual base64 logo `<img class="logo-mark">` + "Emberforge Works"), not the `.mark` gradient square placeholder in the mockup.
- Real footer.
- The existing **contact modal** and its `openContact()` / `submitContact()` script — do not duplicate a second modal. The page's CTA button and nav CTA should call the existing `openContact()`. The mockup includes a copy of the modal only so the button works in isolation; drop it in favor of the site's shared one.
- Existing design tokens, `.kicker`, `.btn`, `.chip`, `.card`/section styling. The only genuinely new CSS is the `.usecase` / `.uc-*` / `.callout` block — pull that across.

## Structure (matches the mockup, in order)
1. Hero — kicker "How We'd Build It", H1 on the core idea ("Most businesses don't need an app…"), lead = the subtitle.
2. Intro — two paragraphs + the ember callout ("You don't need an app just to have an app…").
3. Use cases — section heading + **6 panels** (Client Portal, Claims/Job Management, Internal Ops Dashboard, Partner/Vendor Portal, Scheduling & Pipeline, Custom Reporting). Each panel: number + title, a left column with **The pain** + **The opportunity**, a right column with **What we'd build** + feature **chips**. Copy is final in the mockup.
4. CTA — "Have a workflow like one of these?" + Blueprint copy + **"Start With a Blueprint"** button calling `openContact()`.
5. Footer.

## Meta / SEO
- `<title>` and meta description are in the mockup `<head>`; carry them over.
- Add the page to the sitemap and link it from the homepage nav (and footer if the homepage footer carries page links).

## Acceptance
- Page renders at the chosen route in the real Emberforge nav/footer, visually indistinguishable from the homepage.
- The CTA and nav "Start a Blueprint" open the **existing** shared contact modal and submit through the existing `/api/contact` handler — no second modal or duplicate script.
- Responsive: use-case panels collapse to a single column on mobile (breakpoint ~760px, as in the mockup); nav links hide as they do on the homepage.
- No new fonts, colors, or components beyond the `.usecase`/`.callout` additions.

## Tone (already baked into the copy — keep it)
Practical, confident, plain. A business owner should read a panel and think "that's exactly what we're dealing with." Reinforces Emberforge as a workflow/software partner, not a cheap app builder.


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