#!/usr/bin/env python3
"""
rebuild_wiki.py
Rebuilds the graphify knowledge graph (code AST only, no LLM) 
and regenerates the wiki articles at graphify-out/wiki/.
Run this after modifying code files.
"""
import json
import networkx as nx
from pathlib import Path
from graphify.watch import _rebuild_code
from graphify.wiki import to_wiki

ROOT = Path(__file__).parent.parent

# Step 1: Rebuild the code graph (fast, AST-based, no LLM)
print("[1/2] Rebuilding code graph...")
_rebuild_code(ROOT)

# Step 2: Load updated graph.json
graph_path = ROOT / "graphify-out" / "graph.json"
data = json.loads(graph_path.read_text(encoding="utf-8"))

G = nx.Graph()
for node in data.get("nodes", []):
    G.add_node(node["id"], **{k: v for k, v in node.items() if k != "id"})
for link in data.get("links", []):
    G.add_edge(link["source"], link["target"], **{k: v for k, v in link.items() if k not in ("source", "target")})

communities = {}
for node in data.get("nodes", []):
    cid = node.get("community", 0)
    communities.setdefault(cid, []).append(node["id"])

# Step 3: Rebuild wiki
print(f"[2/2] Building wiki ({G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities)...")
wiki_dir = ROOT / "graphify-out" / "wiki"
wiki_dir.mkdir(exist_ok=True)
n = to_wiki(G, communities, wiki_dir)
print(f"Done! {n} wiki articles at {wiki_dir}")
