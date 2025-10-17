# This file contains helper functions for the maze robot simulation

def create_advanced_maze(width, height, complexity=0.75, density=0.75):
    """
    Generate a more structured maze using a modified depth-first algorithm
    
    Args:
        width: Width of the maze
        height: Height of the maze
        complexity: Complexity factor (0-1)
        density: Density factor (0-1)
        
    Returns:
        List of wall rectangles
    """
    import numpy as np
    import pygame
    
    # Adjust complexity and density relative to maze size
    shape = ((height // 2) * 2 + 1, (width // 2) * 2 + 1)
    complexity = int(complexity * (5 * (shape[0] + shape[1])))
    density = int(density * ((shape[0] // 2) * (shape[1] // 2)))
    
    # Create a grid filled with walls
    Z = np.zeros(shape, dtype=bool)
    
    # Fill borders
    Z[0, :] = Z[-1, :] = Z[:, 0] = Z[:, -1] = 1
    
    # Make random points as starting locations
    for _ in range(density):
        x, y = np.random.randint(0, shape[1] // 2) * 2, np.random.randint(0, shape[0] // 2) * 2
        Z[y, x] = 1
        
        # Carve paths
        for _ in range(complexity):
            directions = []
            if x > 1:
                directions.append((x - 2, y))
            if x < shape[1] - 2:
                directions.append((x + 2, y))
            if y > 1:
                directions.append((x, y - 2))
            if y < shape[0] - 2:
                directions.append((x, y + 2))
                
            if len(directions) > 0:
                dx, dy = directions[np.random.randint(0, len(directions))]
                
                if Z[dy, dx] == 0:
                    Z[dy, dx] = 1
                    Z[dy + (y - dy) // 2, dx + (x - dx) // 2] = 1
                    x, y = dx, dy
    
    # Convert the numpy array to wall rectangles
    wall_thickness = 10
    wall_rects = []
    
    for y in range(Z.shape[0]):
        for x in range(Z.shape[1]):
            if Z[y, x]:
                # Scale to match screen dimensions
                rect_x = x * wall_thickness
                rect_y = y * wall_thickness
                wall_rects.append(pygame.Rect(rect_x, rect_y, wall_thickness, wall_thickness))
    
    return wall_rects