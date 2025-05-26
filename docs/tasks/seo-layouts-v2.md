# SEO Layouts v2 – Development Task List
_A duplicate / upgrade of the current "SEO Layouts" page that fetches data from the new **SEO Layouts** Airtable table and renders each layout embed._

---

## I. Page & Navigation Boiler-plate
- [ ] Duplicate the existing **SEO Layouts** page (`/seo-layouts`) into a new route/component called **SEO Layouts v2** (e.g. `/seo-layouts-v2`).
- [ ] Register the new route with the app router.
- [ ] Add a new sidebar link labelled "SEO Layouts v2" immediately under the original item.
- [ ] Hide / protect the page by the same auth rules that guard the original SEO Layouts page (if any).

## II. Data Source & Client Filtering
- [ ] Create / update an Airtable service for the **SEO Layouts** table (`appUtQLunL1f05FrQ / SEO Layouts`).
- [ ] Fetch the following fields per record:
  - `Name`
  - `Layout Embed`
  - `Client` (linked record → Client table)
- [ ] Read the current client's record ID from `localStorage` (same key used elsewhere in the app).
- [ ] Filter the Airtable query so only records whose `Client` linked record matches the logged-in client are returned.
- [ ] Gracefully handle 0-record responses (see Section IV).

## III. Dynamic Selector Bar
- [ ] Build a dynamic selector component (mirrors existing bars for "Uplift Potential", "Internal Link Map", etc.).
  - [ ] For each returned record, add a selectable pill / tab whose label is the record's `Name`.
  - [ ] Preserve current styling & UX (active state, hover, overflow scroll, etc.).
- [ ] Default selection rules:
  - [ ] If at least one layout exists, auto-select the first record.
  - [ ] If none exist, skip selector rendering entirely (handled in Section IV).

## IV. Empty-State Handling
- [ ] When the filtered Airtable query returns **no layouts**:
  - [ ] Do not show the selector bar.
  - [ ] Render centered copy: "No SEO layouts available for this client."

## V. Layout Display Area
- [ ] Reserve full-width container below the selector bar.
- [ ] When a selector is chosen:
  - [ ] Extract the raw HTML from the `Layout Embed` field (iframe code).
  - [ ] Render the iframe safely (e.g. `dangerouslySetInnerHTML` in React with sanitisation or an iframe wrapper component).
  - [ ] Expand iframe to 100 % width of the content area; set height to 533 px (default) but allow it to be overridden via inline styles present in the embed code.
- [ ] Ensure the layout scales responsively down to tablet width (horizontal scroll for narrower viewports if necessary).

## VI. Performance & Error Handling
- [ ] Debounce / cache Airtable requests to avoid duplicate fetches when switching clients.
- [ ] Show a skeleton loader in the selector bar & layout area while data is loading.
- [ ] Catch and surface Airtable API errors with a user-friendly toast/snackbar.

## VII. Unit / Integration Tests
- [ ] Test that the page:
  - [ ] Shows the correct number of selector items for a mocked client with 3 layouts.
  - [ ] Renders the "No SEO layouts available" message for a mocked client with 0 layouts.
  - [ ] Switches embeds when different selectors are clicked.
  - [ ] Filters out layouts that belong to other clients.
- [ ] Snapshot test the rendered iframe container for one sample record.

## VIII. QA / Acceptance Checklist
- [ ] Sidebar link routes to `/seo-layouts-v2`.
- [ ] Page loads, displays selector pills matching Airtable names.
- [ ] Selecting a pill swaps the embed below.
- [ ] Embed occupies full page width without horizontal scrollbar ≥ 1280 px.
- [ ] Empty-state message appears for a client with no layouts.
- [ ] All copy, fonts, and colors match existing design system tokens.

---
_End of task list – all boxes start unchecked so the developer can tick items off during implementation._ 


#####

This is my original prompt

Please make it so that you duplicate the SEO layouts page and add it to the sidebar as SEO Layouts v2 and now within that SEO layouts v2 you need to use the same structure as we have right now but so that the selectors at the top of the page would be dynamic like we have right now with Uplift Potential, Internal Link Map etc. 

What is going to be the structure of the page? All the data will come from the SEO Layouts table from Airtable and will be filtered based on the client logged in from localstorage. Now when the data is loaded then the selectors at the top will be dynamic based on the SEO layouts available in airtable and if there is nothing then nothing will be displayed and a message saying no SEO layouts available.

Then when we get in the data from SEO Layouts table in Airtable then there will be 3 columns

Name, Layout Embed, Client

name is the name of the layout, layout embed will be the airtable embed code and client will be a linked record column to the client whose SEO layout this is (this should be used to filter out if we're going to show it for the current user logged in or no)

This is the table and one of the rows

Name,Layout Embed,Client
Seo Layout 1,"<iframe class=""airtable-embed"" src=""https://airtable.com/embed/appUtQLunL1f05FrQ/shrlgRihohPFigFku?viewControls=on"" frameborder=""0"" onmousewheel="" width=""100%"" height=""533"" style=""background: transparent


What I need you to do is to readjust the page to have this SEO Layout Embed show as the table (should be across the whole page)