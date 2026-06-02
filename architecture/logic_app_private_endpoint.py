"""Standard Logic App reached over a Private Endpoint.

Renders an Azure topology - Subscription > Resource Group > Virtual Network >
Standard Logic App - showing outbound VNet integration and inbound access via a
Private Endpoint. Output is written as SVG into ``public/assets/diagrams`` so the
Next.js site and the docs can embed it directly.

Run via ``just diagrams`` (or ``uv run python logic_app_private_endpoint.py``).
"""

import os
from pathlib import Path

from diagram_post import postprocess
from diagrams import Cluster, Diagram, Edge
from diagrams.azure.general import ResourceGroups, Subscriptions
from diagrams.azure.integration import LogicApps
from diagrams.azure.network import PrivateEndpoint, Subnets

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

# Post-process the SVG: shrink the oversized icons, embed them so the file is
# portable, and strip the random node ids so the output is deterministic.
if FMT == "svg":
    postprocess(OUTFILE.with_suffix(".svg"), icon_scale=ICON_SCALE)
