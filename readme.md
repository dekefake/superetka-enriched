# SuperETKA Enriched
Maintaining a V10 RS6 is a nightmare when VAG forgot to document technical specifications on ETKA. I'm tired of cross-referencing parts, dealing with unavailabilities and finding myself stuck with lack of spec and counting pixels on YouTube screenshots.

## Core Logic
- Automated Linking: Scans the DOM for VAG reference spans and injects direct search links on OEMVWShop. No more copy-pasting part numbers.
- Data Injection: Hooks into the parts table to inject specific remarks (like O-ring dimensions, material specs, or alternate fitments) based on community information and personal findings.
- Interface Sanitization: Strips the clutter that distracts from technical data. I keep the UI focused on part numbers and descriptions.

## How to use
- Download this repo
- Install it as an unpacked extension in your Manifest V3 compatible browser
- Visit superetka.com
- Enjoy.

## Pull requests

You have knowledge deserving a custom remark in ETKA? Make a pull request, and include a full-page screenshot of your remark on ETKA.
