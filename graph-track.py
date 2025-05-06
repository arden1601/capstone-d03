import heapq
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import time

# matplotlib.use('qt5agg')

# Sample input data
# Format for nodes: [node_id, x_coordinate, y_coordinate] 
INPUT_NODES = [
    [1, 0.1, 0.2],
    [2, 0.4, 0.5],
    [3, 0.7, 0.8],
    [4, 0.2, 0.9],
    [5, 0.6, 0.1],
    [6, 0.9, 0.4],
    [7, 0.3, 0.6],
]

# Format for edges: [node1, node2, weight]
INPUT_EDGES = [
    [1, 2, 1],
    [1, 3, 2],
    [2, 4, 1],
    [2, 5, 3],
    [3, 6, 1],
    [4, 5, 2],
]

START_NODE = 1
END_NODE = 6

def dijkstra(graph, start, end):
    queue = [(0, start)]
    min_cost = {start: 0}
    previous_nodes = {start: None}

    while queue:
        current_cost, current_node = heapq.heappop(queue)

        if current_node == end:
            break

        for neighbor, weight in graph[current_node]['edges'].items():
            cost = current_cost + weight
            if neighbor not in min_cost or cost < min_cost[neighbor]:
                min_cost[neighbor] = cost
                previous_nodes[neighbor] = current_node
                heapq.heappush(queue, (cost, neighbor))

    path = []
    while end is not None:
        path.append(end)
        end = previous_nodes[end]
    path.reverse()

    return path, min_cost[path[-1]] if path else float('inf')

def draw_graph(graph, path=None):
    plt.figure(figsize=(10, 6))
    
    # Draw nodes and edges
    for node, data in graph.items():
        x, y = data['coords']
        plt.scatter(x, y, s=100, label=f'Node {node}')
        plt.text(x, y, str(node), fontsize=12, ha='center', va='center')
        for neighbor, weight in data['edges'].items():
            neighbor_x, neighbor_y = graph[neighbor]['coords']
            plt.plot([x, neighbor_x], [y, neighbor_y], 'k-', alpha=0.5)
            plt.text((x + neighbor_x) / 2, (y + neighbor_y) / 2, str(weight), fontsize=8, ha='center')

    # Highlight the path if it exists
    if path:
        for i in range(len(path) - 1):
            start = graph[path[i]]['coords']
            end = graph[path[i + 1]]['coords']
            plt.plot([start[0], end[0]], [start[1], end[1]], 'r-', linewidth=2)

    plt.title("Graph Visualization")
    plt.xlabel("X Coordinate")
    plt.ylabel("Y Coordinate")
    plt.legend()
    plt.grid()
    plt.axis('equal')
    plt.show()

def animate_movement(path, graph):
    fig, ax = plt.subplots(figsize=(10, 6))
    plt.xlim(-1, 1)
    plt.ylim(-1, 1)
    plt.title("Simulating Movement Along the Shortest Path")
    plt.xlabel("X Coordinate")
    plt.ylabel("Y Coordinate")

    # Draw the graph
    for node, data in graph.items():
        x, y = data['coords']
        ax.scatter(x, y, s=100, label=f'Node {node}')
        ax.text(x, y, str(node), fontsize=12, ha='center', va='center')
        for neighbor, weight in data['edges'].items():
            neighbor_x, neighbor_y = graph[neighbor]['coords']
            ax.plot([x, neighbor_x], [y, neighbor_y], 'k-', alpha=0.5)

    # Animate the movement
    for i in range(len(path) - 1):
        start = graph[path[i]]['coords']
        end = graph[path[i + 1]]['coords']
        for j in range(100):
            ax.scatter(start[0] + (end[0] - start[0]) * j / 100, 
                       start[1] + (end[1] - start[1]) * j / 100, 
                       color='red', s=100)
            plt.pause(0.05)
        plt.scatter(end[0], end[1], color='red', s=100)  # Mark the end node

    plt.show()

def main():
    graph = {}
    
    # Input number of nodes
    # num_nodes = int(input("Enter the number of nodes: "))
    

    # Input node coordinates
    # print("Enter the nodes with their coordinates in the format 'node x y':")
    for input_node in INPUT_NODES:
        # node_input = input().strip().split()
        node = int(input_node[0])
        x = float(input_node[1])
        y = float(input_node[2])
        graph[node] = {'coords': (x, y), 'edges': {}}

    # Input edges and weights
    # num_edges = int(input("Enter the number of edges: "))
    # print("Enter the edges in the format 'node1 node2 weight':")
    for input_edge in INPUT_EDGES:
        # edge_input = input().strip().split()
        node1 = int(input_edge[0])
        node2 = int(input_edge[1])
        weight = int(input_edge[2])
        graph[node1]['edges'][node2] = weight
        graph[node2]['edges'][node1] = weight  # Assuming undirected graph

    # Input start and end nodes
    # start_node = int(input("Enter the start node: "))
    # end_node = int(input("Enter the end node: "))

    # Find the shortest path
    path, total_weight = dijkstra(graph, START_NODE, END_NODE)

    # Output the result
    if path:
        print(f"The shortest path from node {START_NODE} to node {END_NODE} is: {' -> '.join(map(str, path))} with total weight {total_weight}.")
        
        # Draw the graph
        draw_graph(graph, path)
        
        # Animate the movement along the path
        animate_movement(path, graph)
    else:
        print(f"No path exists from node {START_NODE} to node {END_NODE}.")

if __name__ == "__main__":
    main()
