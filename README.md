# BEHAVE — interactive body & brain concept map

English 3 project workspace for Chapters 1–3 of Robert M. Sapolsky’s *Behave*. Rotatable 3D anatomical meshes on a black-to-deep-blue background. No dependencies, accounts, build step, or external assets.

## Run

Download the repository as a ZIP and extract it. Double-click **index.html** to open the website. Keep index.html, style.css, app.js, content.js, and anatomy.js together.

Optional local server: run `python3 -m http.server 8000` in this folder, then open http://localhost:8000. Stop with Ctrl+C.

## Explore

Click numbered brain/body points or the labeled buttons below the map. Chapter buttons and the theme menu filter the index and dim other points; dim points remain selectable. Related-idea buttons navigate between connected entries. The Connections checkbox hides/shows conceptual lines. Controls support Tab and Enter/Space and adapt to phone screens.

## Add your information without coding

1. Select a point, then choose **Edit content**.
2. Enter your title, chapter, theme, explanation, verified evidence, citation, interpretation, and connection explanation.
3. Choose **Save this entry before switching to another point**. Drafts are stored only in this browser/device. They do not automatically update GitHub or other viewers.
4. Choose **Download content.js** to export all saved entries.
5. Replace the repository’s content.js with your downloaded file and commit the change. Locally, replace the file next to index.html.
6. Existing browser drafts take precedence over the file. To view the newly published file without an older draft, open a private browsing window or clear this site's browser storage (export any drafts first).

You can also edit the quoted text directly in content.js. Preserve IDs and the surrounding JavaScript syntax. Coordinates use the SVG's 800 × 760 viewBox. Edit `links` pairs to change conceptual connections. In the initial file, shared placeholder text is generated with `.map`; exporting from the editor produces a plain, fully expanded content file.

## Content boundaries

All explanations, evidence, citations, and interpretations are explicitly marked placeholders. No quotations have been invented. Chapter and theme assignments are starter organization, not a verified chapter outline. In particular, a body organ's inclusion does not assert that the organ or hormones are covered in Chapter 3. Replace/reassign entries to match your actual notes. Connection lines are proposed conceptual links, not verified neural pathways. The anatomy is an artistic schematic with approximate locations, not a medical diagram. Reward circuitry represents a distributed concept, not a single anatomical structure.

## GitHub Pages

This static project can run on GitHub Pages with the repository root as its source. In the repository’s Settings → Pages, select **Deploy from a branch**, then the main branch and **/(root)**, and save. GitHub displays the resulting address once deployment finishes. No build workflow is required.

## Files

- index.html: page structure and 3D canvas and connection overlay
- style.css: translucent blue-white visual style and responsive layout
- app.js: selection, filtering, local drafts, and download behavior
- content.js: editable student content and connections

No explanatory information is sent to a server by the editor. Publishing a changed content.js in a public repository makes that text public.

## 3D models and clearer connections

The brain and body are procedural three-dimensional triangle meshes, lit and rendered locally without external libraries. Use the left/right rotation buttons or Front view to inspect their depth. There is no cursor tilt or automatic movement. The models are conceptual anatomy, not clinical reconstructions.

Only the selected point’s connections are drawn. Each uses a bright color and a dark outline to stay legible. Hover or keyboard-focus a related-idea button to isolate its line; click it to select the related point. Model anchors and lines update when the meshes rotate.

- anatomy.js: original 3D geometry, lighting, projection, and rotation controls.

Anatomy layer switches control the translucent body, skeleton, nerves, and organs separately. Included organs are the heart, adrenal glands, eyes, ears, lungs, and kidneys; lungs and kidneys currently provide visual context rather than separate reading entries. No medical accuracy or chapter-specific coverage is implied by the models.
