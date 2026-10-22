# Higgsfield asset preflight and generation outcome

Checked on 12 October 2026 (Europe/Rome).

## Outcome

Higgsfield is connected, but the requested generations were rejected by account plan restrictions. **No generation job was created, no generated media was downloaded, and no asset in `public/images` was changed.** The site can continue using the existing restaurant photographs and static/procedural visual fallbacks.

The account reports a **free** plan and **10 available credits**. Its trial is pending, with no currently spendable unlimited allowance. No trial, account, project, subscription or preference change was started.

The saved MCP preference is `auto_create_project=false`; all requests omitted a project/folder destination. Higgsfield Home was opened once because the connector requested onboarding. This did not create a media project.

## Requested assets and exact tool responses

| Asset | Request | Quoted cost | Result |
| --- | --- | --- | --- |
| Illustrative food hero loop | Seedance 2.5; text-to-video; 8 seconds; 720p; 16:9; one output; audio disabled | 56 credits | `Requires plus plan or higher.` No job submitted. |
| Seamless worn basalt paving texture | GPT Image 2.5; square; one image | 0.25 credits | `Requires basic plan or higher.` Submission failed; no job ID. |
| Subtle seamless film-grain texture | GPT Image 2.5; square; one image | 0.25 credits | `Requires basic plan or higher.` Submission failed; no job ID. |

The requested set was quoted at **56.5 credits total**, exceeding the currently available 10 credits even apart from the plan restrictions. These quotes are the connector's estimates on the check date; no completed asset cost exists.

The free-generation counters shown by the account cover Genjutsu motion/object editing and AI Influencer Builder. They do not cover these prompt-only food and texture requests, and were not spent or repurposed.

## Prepared visual direction

### Hero film

An eight-second, silent, fictional editorial food scene: freshly served Roman rigatoni on a handmade travertine-cream ceramic plate, aged wood table, subtle oxblood linen, warm amber candlelight, restrained 35mm film appearance and shallow depth of field. The plate sits on the right of a wide composition, leaving quiet olive-brown negative space on the left. The camera is locked; only natural steam and extremely slight distant candle glow move. No people, hands, logos, words or restaurant-identifying details. The prompt asks for matching first/final composition and light for a seamless loop.

### Basalt texture

Top-down orthographic albedo texture of closely fitted irregular worn basalt blocks, rounded edges, narrow warm-earth joints and muted olive-charcoal stone. Uniform diffuse illumination, with no shadows, perspective, plants, objects, text or vignette. Opposite edges requested to tile seamlessly.

### Grain texture

Very fine, evenly distributed monochromatic analog film grain over uniform mid-grey, with no clouds, blobs, fibers, scratches, text, gradient or vignette. Requested as a seamless tile for a very low-opacity overlay.

## Provenance and integration limits

- Provider: Higgsfield MCP; models requested: `seedance_2_5` and `gpt_image_2_5`.
- Job IDs, output URLs, files, dimensions, actual duration and output checksums: **none; generation was rejected before job creation**.
- No media was imported or uploaded as a reference. The requests were prompt-only and did not send restaurant photographs.
- No MP4/WebM compression or visual/seamlessness verification was possible because no output exists.
- If these assets are generated later, keep each video format below 3 MB, remove audio, verify the loop and output duration, and retain a static fallback.
- Any generated food scene must carry a visible illustrative-placeholder caption. It must not be represented as a photograph or video of Grappasonni or as an actual menu dish. Decorative generated textures should remain documented in this provenance file.
