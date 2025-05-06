import matplotlib.pyplot as plt
import networkx as nx

def main():
    # Input node coordinates
    print("Enter nodes in the format: node_name x y (type 'done' to finish):")
    nodes = {}
    while True:
        line = input()
        if line.strip().lower() == "done":
            break
        name, x, y = line.split()
        nodes[name] = (float(x), float(y))

    # Input edges with weights
    print("\nEnter edges in the format: node1 node2 weight (type 'done' to finish):")
    edges = []
    while True:
        line = input()
        if line.strip().lower() == "done":
            break
        u, v, w = line.split()
        edges.append((u, v, float(w)))

    # Create graph
    G = nx.Graph()
    for name, pos in nodes.items():
        G.add_node(name, pos=pos)

    for u, v, w in edges:
        G.add_edge(u, v, weight=w)

    # Input source and destination
    source = input("\nEnter start node: ")
    target = input("Enter destination node: ")

    try:
        path = nx.dijkstra_path(G, source=source, target=target, weight="weight")
        total_weight = nx.dijkstra_path_length(G, source=source, target=target, weight="weight")
        print(f"Shortest path: {' -> '.join(path)} (Total weight: {total_weight})")

        # Draw graph
        pos = nx.get_node_attributes(G, 'pos')
        edge_labels = nx.get_edge_attributes(G, 'weight')

        plt.figure(figsize=(10, 6))
        nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=500, font_weight='bold')
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

        # Highlight the shortest path
        path_edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='red', width=2)

        plt.title(f"Shortest path from {source} to {target}")
        plt.show()
    except nx.NetworkXNoPath:
        print(f"No path found from {source} to {target}.")

if __name__ == "__main__":
    main()
