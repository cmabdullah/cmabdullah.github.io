# Future Craft favicon

Generated with the built-in image generation tool. The cyan-and-white FC monogram on a dark background
identifies Future Craft without using a photograph or floral imagery.

## Files

- `favicon.png`: 512 × 512 master for future exports.
- `favicon-16x16.png` and `favicon-32x32.png`: browser tab icons.
- `apple-touch-icon.png`: 180 × 180 mobile bookmark icon.
- `/favicon.ico`: 16, 32, and 48 pixel frames for browser compatibility and automatic root discovery.

The shared `_includes/head/custom.html` links the icons with Jekyll's `relative_url` filter so they also work
when the site is hosted under a configured `baseurl`. No post-by-post changes are needed.

Exports use ImageMagick to resize the generated artwork; the full-size original remains in the image tool's
output directory. Keep the master when regenerating the smaller assets.

## Generation prompt

Use case: logo-brand. Asset type: favicon for a technology and programming blog named FUTURE CRAFT. Create exactly one finished square 1024 x 1024 raster icon, not a presentation or mockup. A bold custom geometric uppercase FC monogram, F in bright cyan and C in clean white, centered on a solid deep navy #101820 square background that fills the canvas edge to edge. The two letters must remain clearly distinguishable with thick simple strokes and ample spacing, occupying about 72 percent of the square width, optically centered, readable at 16 x 16 pixels. Flat two-color lettering, crisp edges, strong contrast, professional understated technology identity. Text exactly: FC. No other text. No flowers, plants, mountains, illustrations, thin lines, gradients, textures, shadows, 3D, borders, rounded outer tile, watermark, or surrounding whitespace. The image itself is the icon.
