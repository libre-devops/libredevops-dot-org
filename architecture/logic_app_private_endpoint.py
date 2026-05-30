"""Standard Logic App reached over a Private Endpoint.

Renders an Azure topology - Subscription > Resource Group > Virtual Network >
Standard Logic App - showing outbound VNet integration and inbound access via a
Private Endpoint. Output is written as SVG into ``public/assets/diagrams`` so the
Next.js site and the docs can embed it directly.

Run via ``just diagrams`` (or ``uv run python logic_app_private_endpoint.py``).
"""

import base64
import os
import re
from pathlib import Path

from diagrams import Cluster, Diagram, Edge
from diagrams.azure.general import ResourceGroups, Subscriptions
from diagrams.azure.integration import LogicApps
from diagrams.azure.network import PrivateEndpoint, Subnets, VirtualNetworks

# Repo-root/public/assets/diagrams, resolved relative to this file so the script
# works regardless of the current working directory.
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "diagrams"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FMT = os.environ.get("DIAGRAM_FORMAT", "svg")
OUTFILE = OUTPUT_DIR / "logic-app-private-endpoint"

# `diagrams` renders every icon in a fixed ~1.4in box that visually dominates
# the diagram, and graphviz has no per-render knob to shrink the icon without
# clipping the (wider) node labels. So we scale the icon <image> elements down
# about their centre in the generated SVG - layout and labels stay put.
ICON_SCALE = 0.5


def shrink_svg_icons(svg_path: Path, scale: float = ICON_SCALE) -> None:
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
    """Embed externally-referenced PNG icons as base64 data URIs.

    Graphviz writes icon nodes as ``<image href="/abs/path/to/icon.png">``
    pointing at the `diagrams` package on the build machine. Those paths 404
    when the SVG is served over HTTP, so the icons vanish. Inlining them makes
    the SVG self-contained and portable.
    """
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

INK = "#1c2128"      # dark text - the diagram renders on a light card (see CSS)
MUTED = "#57606a"    # secondary labels
ACCENT = "#8b5cf6"   # brand purple - private endpoint (inbound) path
OUTBOUND = "#2f9e6f"  # green - VNet integration (outbound) path

graph_attr = {
    "bgcolor": "transparent",  # the .doc-diagram CSS card provides the background
    "pad": "0.4",
    "fontname": "Helvetica",
    "fontcolor": INK,
    "splines": "spline",
    "nodesep": "0.5",
    "ranksep": "0.8",
}

# Icon size is reduced after rendering (see shrink_svg_icons); here we only set
# the label typography.
node_attr = {"fontname": "Helvetica", "fontcolor": INK, "fontsize": "14"}
edge_attr = {"fontname": "Helvetica", "fontcolor": MUTED, "fontsize": "11"}


def _cluster(label: str, fill: str) -> dict:
    return {"bgcolor": fill, "fontname": "Helvetica", "fontcolor": INK, "label": label}


with Diagram(
    "",
    filename=str(OUTFILE),
    outformat=FMT,
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
):
    with Cluster("Subscription: sub-ldo-prd", graph_attr=_cluster("Subscription: sub-ldo-prd", "#f6f5fb")):
        subscription = Subscriptions("sub-ldo-prd")

        with Cluster(
            "Resource Group: rg-ldo-uks-prd-01",
            graph_attr=_cluster("Resource Group: rg-ldo-uks-prd-01", "#efeef8"),
        ):
            resource_group = ResourceGroups("rg-ldo-uks-prd-01")
            logic_app = LogicApps("logic-ldo-uks-prd-01\n(Standard)")

            with Cluster(
                "Virtual Network: vnet-ldo-uks-prd-01",
                graph_attr=_cluster("Virtual Network: vnet-ldo-uks-prd-01", "#e9f0fb"),
            ):
                with Cluster(
                    "snet-integration  ·  /26",
                    graph_attr=_cluster("snet-integration  ·  /26  ·  delegated", "#e7f3ec"),
                ):
                    integration_subnet = Subnets("Microsoft.Web/\nserverFarms")

                with Cluster(
                    "snet-private-endpoints  ·  /27",
                    graph_attr=_cluster("snet-private-endpoints  ·  /27", "#efe9fb"),
                ):
                    private_endpoint = PrivateEndpoint("pep-logic-ldo-uks-prd-01")

    # Hierarchy (faint, structural)
    subscription >> Edge(color=MUTED, style="dashed") >> resource_group

    # Outbound: Logic App integrates into the delegated subnet
    logic_app >> Edge(
        label="VNet integration (outbound)",
        color=OUTBOUND,
        fontcolor=OUTBOUND,
        penwidth="2",
    ) >> integration_subnet

    # Inbound: callers reach the Logic App's "sites" subresource via the PE
    private_endpoint >> Edge(
        label="Private Endpoint (inbound · sites)",
        color=ACCENT,
        fontcolor=ACCENT,
        penwidth="2",
    ) >> logic_app

# Post-process the SVG: shrink the oversized icons, then embed them so the file
# is portable (the PNG paths Graphviz wrote point at the build machine's venv).
if FMT == "svg":
    svg_out = OUTFILE.with_suffix(".svg")
    shrink_svg_icons(svg_out)
    inline_svg_images(svg_out)
