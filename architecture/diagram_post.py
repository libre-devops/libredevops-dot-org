"""Shared SVG post-processing for the architecture diagrams.

`diagrams` (mingrammer) + Graphviz produce SVGs that need three fix-ups before
they are committed and served:

1. ``shrink_svg_icons``    - scale the oversized bitmap icons down about their
   centre so they sit at a similar weight to labels / vector shapes.
2. ``inline_svg_images``   - embed externally-referenced PNG icons as base64 so
   the SVG is self-contained (Graphviz writes absolute venv paths that 404 once
   served over HTTP).
3. ``strip_nondeterminism`` - remove Graphviz ``<!-- comments -->`` and
   ``<title>`` elements. `diagrams` seeds every node with a random
   ``uuid.uuid4().hex`` id that surfaces only in those non-rendered elements, so
   stripping them makes the output byte-stable across runs (for a given Graphviz
   version). This is what lets CI diff the committed SVGs against a fresh render.

Call ``postprocess(svg_path)`` to apply all three in the correct order.
"""

import base64
import re
from pathlib import Path

DEFAULT_ICON_SCALE = 0.5


def shrink_svg_icons(svg_path: Path, scale: float) -> None:
    svg = svg_path.read_text(encoding="utf-8")

    def scale_image(match: "re.Match[str]") -> str:
        tag = match.group(0)

        def num(attr: str) -> float | None:
            found = re.search(rf'\b{attr}="([-\d.]+)(?:px)?"', tag)
            return float(found.group(1)) if found else None

        w, h, x, y = num("width"), num("height"), num("x"), num("y")
        if w is None or h is None or x is None or y is None:
            return tag

        updates = {
            "width": (w * scale, "px"),
            "height": (h * scale, "px"),
            "x": (x + (w - w * scale) / 2, ""),
            "y": (y + (h - h * scale) / 2, ""),
        }
        for attr, (value, unit) in updates.items():
            tag = re.sub(
                rf'\b{attr}="[-\d.]+(?:px)?"', f'{attr}="{value:.2f}{unit}"', tag, count=1
            )
        return tag

    svg = re.sub(r"<image\b[^>]*?/>", scale_image, svg)
    svg_path.write_text(svg, encoding="utf-8")


def inline_svg_images(svg_path: Path) -> None:
    svg = svg_path.read_text(encoding="utf-8")

    def replace(match: "re.Match[str]") -> str:
        attr, quote, file_path = match.group(1), match.group(2), match.group(3)
        png = Path(file_path)
        if not png.is_file():
            return match.group(0)
        data = base64.b64encode(png.read_bytes()).decode("ascii")
        return f"{attr}={quote}data:image/png;base64,{data}{quote}"

    svg = re.sub(r'(xlink:href|href)=(["\'])([^"\']+\.png)\2', replace, svg)
    svg_path.write_text(svg, encoding="utf-8")


def strip_nondeterminism(svg_path: Path) -> None:
    """Remove Graphviz comments and <title> elements.

    Both carry the random per-node ``uuid.uuid4().hex`` ids (and the Graphviz
    version string) but render nothing, so removing them makes the SVG
    deterministic without changing the image.
    """
    svg = svg_path.read_text(encoding="utf-8")
    svg = re.sub(r"<!--.*?-->\n?", "", svg, flags=re.DOTALL)
    svg = re.sub(r"<title>.*?</title>\n?", "", svg, flags=re.DOTALL)
    svg_path.write_text(svg, encoding="utf-8")


def postprocess(svg_path: Path, icon_scale: float = DEFAULT_ICON_SCALE) -> None:
    """Apply icon shrink, image inlining, and non-determinism stripping in order."""
    shrink_svg_icons(svg_path, icon_scale)
    inline_svg_images(svg_path)
    strip_nondeterminism(svg_path)
