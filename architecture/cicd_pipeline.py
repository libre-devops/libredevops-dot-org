"""Example secure CI/CD pipeline (SDLC).

Renders the standard flow: a protected repo, a pull request that runs the
Continuous Integration gates (lint/test, secure scans, build), a CODEOWNER
review gate, and a Continuous Deployment chain (dev to staging to a gated prod)
that releases into Azure. Language-agnostic - the same shape applies to
Terraform, Python, TypeScript, and so on. Output is written as SVG into
``public/assets/diagrams`` so the docs can embed it directly.

Run via ``just diagrams`` (or ``uv run python cicd_pipeline.py``).
"""

import os
from pathlib import Path

from diagram_post import postprocess
from diagrams import Cluster, Diagram, Edge
from diagrams.azure.general import Subscriptions
from diagrams.onprem.ci import GithubActions
from diagrams.onprem.vcs import Github
from diagrams.programming.flowchart import (
    Action,
    Decision,
    Document,
    Inspection,
    PredefinedProcess,
)

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "diagrams"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FMT = os.environ.get("DIAGRAM_FORMAT", "svg")
OUTFILE = OUTPUT_DIR / "cicd-pipeline"

ICON_SCALE = 0.6

INK = "#1c2128"
MUTED = "#57606a"
ACCENT = "#8b5cf6"     # brand purple - the review gate
APPROVED = "#2f9e6f"   # green - approved / deploy path
REJECT = "#cf222e"     # red - changes-requested loop

graph_attr = {
    "bgcolor": "transparent",
    "pad": "0.4",
    "fontname": "Helvetica",
    "fontcolor": INK,
    "splines": "spline",
    "nodesep": "0.5",
    "ranksep": "0.7",
}
node_attr = {"fontname": "Helvetica", "fontcolor": INK, "fontsize": "13"}
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
    repo = Github("Repo\n(protected main)")
    pr = Document("Pull Request\n(feature branch)")

    with Cluster(
        "Continuous Integration  ·  on pull request",
        graph_attr=_cluster("Continuous Integration  ·  on pull request", "#eef2f8"),
    ):
        build_test = GithubActions("Lint · format\nunit tests")
        scans = Inspection("Secure scans\ngitleaks · SAST · SCA")
        artifact = PredefinedProcess("Build once\nversioned artifact")
        build_test >> Edge(color=MUTED) >> scans >> Edge(color=MUTED) >> artifact

    review = Decision("CODEOWNER\napproval +\nchecks green?")
    merge = Action("Merge to main\n(squash)")

    with Cluster(
        "Continuous Deployment  ·  on merge",
        graph_attr=_cluster("Continuous Deployment  ·  on merge", "#e7f3ec"),
    ):
        dev = Action("Deploy dev\n(auto)")
        staging = Action("Deploy staging\n(auto)")
        prod = Action("Deploy prod\n(approval gate)")
        dev >> Edge(color=APPROVED) >> staging >> Edge(color=APPROVED) >> prod

    azure = Subscriptions("Azure\nenvironments")

    # Main path
    repo >> Edge(color=INK, penwidth="2") >> pr
    pr >> Edge(color=INK, penwidth="2") >> build_test
    artifact >> Edge(color=ACCENT, fontcolor=ACCENT, penwidth="2", label="reviewed") >> review
    review >> Edge(color=APPROVED, fontcolor=APPROVED, penwidth="2", label="approved") >> merge
    merge >> Edge(color=APPROVED, penwidth="2") >> dev
    prod >> Edge(color=APPROVED, fontcolor=APPROVED, penwidth="2", label="release") >> azure

    # Changes-requested loop (constraint=false keeps the main chain laid out cleanly)
    review >> Edge(
        color=REJECT,
        fontcolor=REJECT,
        style="dashed",
        label="changes requested",
        constraint="false",
    ) >> pr

if FMT == "svg":
    postprocess(OUTFILE.with_suffix(".svg"), icon_scale=ICON_SCALE)
