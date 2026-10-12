# BEHAVE — interactive anatomical concept map

A single-page English 3 project for Chapters 1–3 of Robert M. Sapolsky's *Behave*, with detailed 3D anatomical models, a transparent body, skeleton, nerves, and organs. Black-to-deep-blue background; blue-white lighting. Entries contain a book paraphrase, supporting biology, original examples, interpretations, and source links. No direct quotations or invented page citations are included.

## Open the website

Live website: https://cjtiner.github.io/behave-concept-map/

For local use, download and extract the project, then open index.html in a current Chrome, Edge, Firefox, or Safari browser with WebGL. Keep **all files together**, including model-data.js, region-data.js, and bundled three.min.js. No installation or build is needed. Loading the anatomical dataset may take several seconds.

If your browser restricts local files, run `python3 -m http.server 8000` in this folder and open http://localhost:8000. Stop the server with Ctrl+C.

## Explore

- Select a numbered point or its labeled button to open a reading entry.
- The left/right arrows rotate the actual 3D models; Front view resets them. There is no cursor tilt or automatic rotation.
- Body, Skeleton, Nerves, and Organs switches control visibility.
- Connections restores the original dashed curves, with all links visible and the selected point’s links brighter. Hover or keyboard-focus a related-idea button to isolate one line; click it to navigate.
- Selecting a brain topic highlights its region in cyan. Inner regions show through a translucent cortex; reward circuitry is an illustrative distributed network.
- Chapter and theme filters organize reading entries. Pins are spaced apart for smaller screens and side views.

## Edit the content

1. Select a point and choose **Edit content**.
2. Replace its title, chapter, theme, explanation, verified text evidence, citation, interpretation, and connection explanation.
3. Choose **Save this entry** before switching points. Drafts are saved in this browser/device only.
4. Choose **Download content.js** to export saved entries.
5. Replace content.js in this repository and commit it to update the published website. Existing browser drafts are preserved and take precedence; use a private browser window to check the new published version without an old draft.

Alternatively, edit the text directly in content.js. Preserve the IDs and JavaScript syntax. The `links` pairs control which concepts are connected. Exporting through the editor expands the starter content into a plain editable file.

## Anatomy and content boundaries

The models use BodyParts3D reference anatomy, with source attribution and licenses in ATTRIBUTION.md. They are detailed anatomical meshes, not a claim of medical completeness. Source nerve meshes are supplemented with simplified whole-body branches, including arms, hands, torso, legs, and feet. These additional branches are illustrative, not medically complete anatomy. Reading pins are approximate concept annotations; connections are not verified biological pathways. The brain view is enlarged and separately positioned.

The organ reading entries are heart, adrenal glands, eyes, and ears. The external ears are part of the detailed body surface. Chapter 3 concerns sensory triggers. Heart and adrenal entries are supporting biology associated with the Chapter 2 brain–body theme; the fuller hormone discussion is in Chapter 4. Add required quotations and page references from your own edition.

## Files

- index.html / style.css: page and appearance
- app.js: content selection, filters, editor, connections, and export
- content.js: student text and conceptual relationships
- anatomy.js: 3D viewer, materials, lighting, and rotation
- model-data.js / region-data.js: compressed anatomical mesh and highlight data
- three.min.js / THREE-LICENSE.txt: bundled renderer and license
- ATTRIBUTION.md: anatomical model sources and licensing

GitHub Pages publishes the main branch's root folder. Editing drafts in the browser does not automatically change GitHub. Committing content to this public repository makes it public.
