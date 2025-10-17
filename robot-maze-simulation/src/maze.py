import pygame
import sys
import math
import random
import numpy as np
from utils import create_advanced_maze

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 30
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (50, 50, 200)
GRAY = (100, 100, 100)
YELLOW = (255, 255, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
LIGHT_BLUE = (200, 200, 255)  # For coverage tracking

class Maze:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.wall_thickness = 10
        self.walls = []
        
        # Create outer boundary
        self.walls.append(pygame.Rect(0, 0, width, self.wall_thickness))  # Top
        self.walls.append(pygame.Rect(0, height-self.wall_thickness, width, self.wall_thickness))  # Bottom
        self.walls.append(pygame.Rect(0, 0, self.wall_thickness, height))  # Left
        self.walls.append(pygame.Rect(width-self.wall_thickness, 0, self.wall_thickness, height))  # Right
        
        # Generate internal walls for the maze
        self.generate_maze()
        
        # Grid for tracking coverage
        self.grid_size = 20
        self.coverage_grid = np.zeros((height // self.grid_size + 1, width // self.grid_size + 1), dtype=bool)
        self.total_cells = np.sum(~self.is_wall_grid())
        
    def generate_maze(self):
        # Use the advanced maze generation from utils
        try:
            maze_walls = create_advanced_maze(
                width=self.width // self.wall_thickness, 
                height=self.height // self.wall_thickness,
                complexity=0.75,
                density=0.5
            )
            self.walls.extend(maze_walls)
        except Exception as e:
            print(f"Error using advanced maze: {e}. Falling back to simple maze.")
            self.generate_simple_maze()
    
    def generate_simple_maze(self):
        # Create a simple maze with internal walls
        num_walls = 15  # Number of internal walls
        
        for _ in range(num_walls):
            # Decide horizontal or vertical wall
            is_horizontal = random.choice([True, False])
            
            if is_horizontal:
                # Horizontal wall
                wall_length = random.randint(50, 300)
                x = random.randint(self.wall_thickness, self.width - wall_length - self.wall_thickness)
                y = random.randint(self.wall_thickness*2, self.height - self.wall_thickness*3)
                self.walls.append(pygame.Rect(x, y, wall_length, self.wall_thickness))
            else:
                # Vertical wall
                wall_length = random.randint(50, 200)
                x = random.randint(self.wall_thickness*2, self.width - self.wall_thickness*3)
                y = random.randint(self.wall_thickness, self.height - wall_length - self.wall_thickness)
                self.walls.append(pygame.Rect(x, y, self.wall_thickness, wall_length))
    
    def is_wall(self, x, y):
        # Check if the given point is inside any wall
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return True
        
        point = pygame.Rect(x-1, y-1, 2, 2)  # Small rect around the point
        for wall in self.walls:
            if wall.colliderect(point):
                return True
        return False
    
    def is_wall_grid(self):
        # Create a grid representation of walls
        grid = np.zeros((self.height // self.grid_size + 1, self.width // self.grid_size + 1), dtype=bool)
        for i in range(grid.shape[0]):
            for j in range(grid.shape[1]):
                x, y = j * self.grid_size, i * self.grid_size
                grid[i, j] = self.is_wall(x, y)
        return grid
    
    def update_coverage(self, x, y):
        # Mark the grid cell as visited
        grid_x = int(x) // self.grid_size
        grid_y = int(y) // self.grid_size
        
        if 0 <= grid_x < self.coverage_grid.shape[1] and 0 <= grid_y < self.coverage_grid.shape[0]:
            self.coverage_grid[grid_y, grid_x] = True
    
    def get_coverage_percentage(self):
        # Calculate percentage of non-wall cells that have been visited
        visited_cells = np.sum(self.coverage_grid & ~self.is_wall_grid())
        return (visited_cells / max(1, self.total_cells)) * 100
        
    def draw(self, screen):
        # Draw coverage grid
        for i in range(self.coverage_grid.shape[0]):
            for j in range(self.coverage_grid.shape[1]):
                if self.coverage_grid[i, j] and not self.is_wall(j * self.grid_size, i * self.grid_size):
                    pygame.draw.rect(screen, LIGHT_BLUE, 
                                     (j * self.grid_size, i * self.grid_size, 
                                      self.grid_size, self.grid_size))
        
        # Draw walls
        for wall in self.walls:
            pygame.draw.rect(screen, BLACK, wall)  # Black walls
