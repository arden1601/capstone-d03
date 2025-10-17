import pygame
import sys
import math
import random
import numpy as np

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
BROWN = (139, 69, 19)  # For the "rice field" appearance

class RiceFieldMap:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.wall_thickness = 30
        self.barrier_thickness = 70
        self.walls = []
        
        # Create outer boundary
        self.walls.append(pygame.Rect(0, 0, width, self.wall_thickness))  # Top
        self.walls.append(pygame.Rect(0, height-self.wall_thickness, width, self.wall_thickness))  # Bottom
        self.walls.append(pygame.Rect(0, 0, self.wall_thickness, height))  # Left
        self.walls.append(pygame.Rect(width-self.wall_thickness, 0, self.wall_thickness, height))  # Right
        
        # Create the rice field layout
        self.create_rice_field_layout()
        
        # Grid for tracking coverage
        self.grid_size = 20
        self.coverage_grid = np.zeros((height // self.grid_size + 1, width // self.grid_size + 1), dtype=bool)
        self.total_cells = np.sum(~self.is_wall_grid())
        
    def create_rice_field_layout(self):
    # Calculate dimensions
        column_width = (self.width - 2 * self.barrier_thickness) / 4  # Divide by 4 for even spacing with 3 barriers
        row_height = (self.height - 2 * self.barrier_thickness) / 4

        # Create two horizontal rows (top and bottom of the rice field)
        # Top horizontal row (about 20% from the top)
        top_row_y = row_height
        # self.walls.append(pygame.Rect(
        #     self.wall_thickness, 
        #     int(top_row_y), 
        #     self.width - 2 * self.wall_thickness, 
        #     self.wall_thickness
        # ))

        # Bottom horizontal row (about 20% from the bottom)
        bottom_row_y = self.height - row_height - self.wall_thickness
        # self.walls.append(pygame.Rect(
        #     self.wall_thickness, 
        #     int(bottom_row_y), 
        #     self.width - 2 * self.wall_thickness, 
        #     self.wall_thickness
        # ))

        # Calculate the height of the vertical barriers (20% of available vertical space)
        barrier_height = int((bottom_row_y - top_row_y) * 0.8)

        # Calculate vertical position for barriers (centered between top and bottom rows)
        barrier_y = int(top_row_y + (bottom_row_y - top_row_y - barrier_height) / 2)
    
        # Create three barrier columns evenly spaced between left and right walls
        for i in range(1, 4):  # Three barriers
            x_pos = self.wall_thickness + i * column_width

            # Each barrier is 20% of the height in the middle section
            self.walls.append(pygame.Rect(
                int(x_pos), 
                barrier_y,
                self.barrier_thickness, 
                barrier_height
            ))
    
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
        # Draw rice field background
        for i in range(self.height // self.grid_size):
            for j in range(self.width // self.grid_size):
                x, y = j * self.grid_size, i * self.grid_size
                if not self.is_wall(x, y):
                    # Create a checkered pattern for rice field appearance
                    if (i + j) % 2 == 0:
                        color = (200, 230, 180)  # Light green
                    else:
                        color = (180, 220, 160)  # Slightly darker green
                    pygame.draw.rect(screen, color, 
                                    (j * self.grid_size, i * self.grid_size, 
                                     self.grid_size, self.grid_size))
        
        # Draw coverage grid
        for i in range(self.coverage_grid.shape[0]):
            for j in range(self.coverage_grid.shape[1]):
                if self.coverage_grid[i, j] and not self.is_wall(j * self.grid_size, i * self.grid_size):
                    pygame.draw.rect(screen, LIGHT_BLUE, 
                                     (j * self.grid_size, i * self.grid_size, 
                                      self.grid_size, self.grid_size))
        
        # Draw walls
        for wall in self.walls:
            pygame.draw.rect(screen, BROWN, wall)  # Brown walls for rice field appearance