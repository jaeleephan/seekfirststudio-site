# seekfirststudio.com

Hand-coded static site. No build step. Every file in this folder gets published as is.

## Hosting
The site is hosted free on GitHub Pages from this repository (main branch, root folder).
The CNAME file tells GitHub to serve it at seekfirststudio.com. Don't delete it.
Any change pushed to main goes live in about a minute.

DNS (at Squarespace Domains):
- A records for @: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME for www: jaeleephan.github.io

## Turn on the contact form
1. Follow the "Website form setup" doc in Drive (05 Brand & Marketing / Website).
2. The Web app URL is already in FORM_ENDPOINT at the top of assets/site.js. Submissions land in the Website Leads tab of the Pipeline and email jae@seekfirststudio.com.
If FORM_ENDPOINT is ever cleared, the form falls back to opening a pre-filled email.

## Use Neue Haas Grotesk Display
Create a web project in Adobe Fonts with Neue Haas Grotesk Display, then paste its stylesheet link into the head of index.html and both pages in /work (there's a comment marking the spot). The site picks it up automatically and falls back to Inter Display.

## Add a film
In index.html, find the Work section, copy one `<article class="card">` block and change the Vimeo ID, title, details and image. The data-tags value (brand, athlete, doc) controls the filters.

## Video embeds
Films play from Vimeo. If a film won't play on the site, open its Vimeo privacy settings and allow embedding on seekfirststudio.com.
