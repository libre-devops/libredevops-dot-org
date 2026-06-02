"""Production Terraform pull-request workflow.

Renders the gated change flow for Terraform: a protected repo, a pull request,
the required CI checks and plan, the CODEOWNER approval gate, and the merge that
triggers an apply of the reviewed plan into Azure. Output is written as SVG into
``public/assets/diagrams`` so the docs can embed it directly.

Run via ``just diagrams`` (or ``uv run python terraform_pr_workflow.py``).
"""

import os
from pathlib import Path

from diagram_post import postprocess
from diagrams import Cluster, Diagram, Edge
from diagrams.azure.general import Subscriptions
from diagrams.onprem.ci import GithubActions
from diagrams.onprem.iac import Terraform
from diagrams.onprem.vcs import Github
from diagrams.programming.flowchart import Action, Decision, Document

# Repo-root/public/assets/diagrams, resolved relative to this file so the script
# works regardless of the current working directory.
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "diagrams"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FMT = os.environ.get("DIAGRAM_FORMAT", "svg")
OUTFILE = OUTPUT_DIR / "terraform-pr-workflow"

# `diagrams` renders bitmap (PNG) icons in a fixed ~1.4in box that dwarfs the
# vector flowchart shapes. Scale only the <image> icons down about their centre
# so the GitHub and Azure logos sit at a similar weight to the shapes.
ICON_SCALE = 0.6


INK = "#1c2128"       # dark text - the diagram renders on a light card (see CSS)
MUTED = "#57606a"     # secondary labels / structural edges
ACCENT = "#8b5cf6"    # brand purple - the gate
APPROVED = "#2f9e6f"  # green - the approved / apply path
REJECT = "#cf222e"    # red - changes-requested loop back

graph_attr = {
    "bgcolor": "transparent",  # the .doc-diagram CSS card provides the background
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
    repo = Github("Repo: main\n(branch protected)")
    pr = Document("Pull Request\n(feature branch)")

    with Cluster(
        "Required checks (status gates)",
        graph_attr=_cluster("Required checks (status gates)", "#eef2f8"),
    ):
        checks = GithubActions("CI checks\nfmt · validate\ntflint · scan")
        plan = Terraform("terraform plan\n(posted to PR)")
        checks >> Edge(color=MUTED) >> plan

    review = Decision("CODEOWNER\napproval +\nchecks green?")
    merge = Action("Merge to main\n(squash)")
    apply = Terraform("terraform apply\n(reviewed plan)")
    azure = Subscriptions("Azure\nsubscription")

    # Main path: branch to pull request to the required checks
    repo >> Edge(color=INK, penwidth="2") >> pr
    pr >> Edge(color=INK, penwidth="2") >> checks

    # Plan feeds the review gate
    plan >> Edge(color=ACCENT, fontcolor=ACCENT, penwidth="2", label="plan reviewed") >> review

    # Approved path (green) merges and applies the reviewed plan
    review >> Edge(color=APPROVED, fontcolor=APPROVED, penwidth="2", label="approved") >> merge
    merge >> Edge(color=APPROVED, penwidth="2") >> apply
    apply >> Edge(color=APPROVED, fontcolor=APPROVED, penwidth="2", label="apply reviewed plan") >> azure

    # Changes-requested loop (red, dashed) back to the pull request.
    # constraint=false so this back-edge does not influence rank ordering -
    # keeps the main chain laid out cleanly left to right.
    review >> Edge(
        color=REJECT,
        fontcolor=REJECT,
        style="dashed",
        label="changes requested",
        constraint="false",
    ) >> pr

# Post-process the SVG: shrink the oversized bitmap icons, embed them so the file
# is portable, and strip the random node ids so the output is deterministic.
if FMT == "svg":
    postprocess(OUTFILE.with_suffix(".svg"), icon_scale=ICON_SCALE)
