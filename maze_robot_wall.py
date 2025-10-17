import pygame
import sys
import math
import random

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
    
    def generate_maze(self):
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
        point = pygame.Rect(x-1, y-1, 2, 2)  # Small rect around the point
        for wall in self.walls:
            if wall.colliderect(point):
                return True
        return False
    
    def draw(self, screen):
        for wall in self.walls:
            pygame.draw.rect(screen, BLACK, wall)  # Black walls

class Robot:
    def __init__(self, x, y, maze):
        self.x = x
        self.y = y
        self.angle = 0  # Facing right initially
        self.speed = 2
        self.rotation_speed = 3
        self.maze = maze
        self.radius = 15
        
        # Ultrasonic sensors 
        self.sensor_range = 150
        self.left_sensor_active = False
        self.right_sensor_active = False
        self.left_sensor_distance = 0
        self.right_sensor_distance = 0
    
    def update(self):
        # Check sensors
        self.left_sensor_active, self.left_sensor_distance = self.check_sensor(-30)  # Left sensor
        self.right_sensor_active, self.right_sensor_distance = self.check_sensor(30)  # Right sensor
        
        # Navigation logic based on ultrasound readings
        # If sensor reads "infinite" (no obstacle within range), turn in that direction
        if self.left_sensor_distance == float('inf') and self.right_sensor_distance != float('inf'):
            # Left is clear (infinite), turn left
            self.angle -= self.rotation_speed
            self.move_forward()
        elif self.right_sensor_distance == float('inf') and self.left_sensor_distance != float('inf'):
            # Right is clear (infinite), turn right
            self.angle += self.rotation_speed
            self.move_forward()
        elif self.left_sensor_distance == float('inf') and self.right_sensor_distance == float('inf'):
            # Both sides clear, choose randomly or go straight
            if random.random() < 0.1:  # Small chance to turn randomly
                self.angle += random.choice([-1, 1]) * self.rotation_speed
            self.move_forward()
        else:
            # Both sides have obstacles, find the side with more space
            if self.left_sensor_distance > self.right_sensor_distance:
                self.angle -= self.rotation_speed * 1.5
            else:
                self.angle += self.rotation_speed * 1.5
    
    def check_sensor(self, relative_angle):
        # Calculate the absolute angle of the sensor beam
        beam_angle = (self.angle + relative_angle) % 360
        beam_angle_rad = math.radians(beam_angle)
        
        # Check for collision along the beam
        for distance in range(1, self.sensor_range + 1):
            beam_x = self.x + distance * math.cos(beam_angle_rad)
            beam_y = self.y + distance * math.sin(beam_angle_rad)
            
            # Check if beam hits a wall
            if self.maze.is_wall(beam_x, beam_y):
                return True, distance
        
        # No collision within range (infinite)
        return False, float('inf')
    
    def move_forward(self):
        # Calculate new position
        angle_rad = math.radians(self.angle)
        new_x = self.x + self.speed * math.cos(angle_rad)
        new_y = self.y + self.speed * math.sin(angle_rad)
        
        # Check if new position is valid (not inside a wall)
        if not self.maze.is_wall(new_x, new_y):
            self.x = new_x
            self.y = new_y
    
    def draw(self, screen):
        # Draw robot body (circle)
        pygame.draw.circle(screen, BLUE, (int(self.x), int(self.y)), self.radius)
        
        # Draw direction indicator (line pointing forward)
        angle_rad = math.radians(self.angle)
        end_x = self.x + self.radius * math.cos(angle_rad)
        end_y = self.y + self.radius * math.sin(angle_rad)
        pygame.draw.line(screen, BLACK, (self.x, self.y), (end_x, end_y), 2)
        
        # Draw left sensor indicator lamp
        left_angle_rad = math.radians(self.angle - 90)
        left_lamp_x = self.x + self.radius * math.cos(left_angle_rad)
        left_lamp_y = self.y + self.radius * math.sin(left_angle_rad)
        # Yellow when detecting infinite, gray otherwise
        left_color = YELLOW if self.left_sensor_distance == float('inf') else GRAY
        pygame.draw.circle(screen, left_color, (int(left_lamp_x), int(left_lamp_y)), 5)
        
        # Draw right sensor indicator lamp
        right_angle_rad = math.radians(self.angle + 90)
        right_lamp_x = self.x + self.radius * math.cos(right_angle_rad)
        right_lamp_y = self.y + self.radius * math.sin(right_angle_rad)
        # Yellow when detecting infinite, gray otherwise
        right_color = YELLOW if self.right_sensor_distance == float('inf') else GRAY
        pygame.draw.circle(screen, right_color, (int(right_lamp_x), int(right_lamp_y)), 5)
        
        # Draw sensor beams
        self.draw_sensor_beam(screen, -30)  # Left sensor
        self.draw_sensor_beam(screen, 30)   # Right sensor
    
    def draw_sensor_beam(self, screen, relative_angle):
        # Calculate the absolute angle of the sensor beam
        beam_angle = (self.angle + relative_angle) % 360
        beam_angle_rad = math.radians(beam_angle)
        
        # Draw the beam - green for "infinite" detection, red when obstacle detected
        for distance in range(1, self.sensor_range + 1):
            beam_x = self.x + distance * math.cos(beam_angle_rad)
            beam_y = self.y + distance * math.sin(beam_angle_rad)
            
            # Check if beam hits a wall
            if self.maze.is_wall(beam_x, beam_y):
                # Draw a red beam that stops at the wall
                pygame.draw.line(screen, RED, (self.x, self.y), (beam_x, beam_y), 1)
                return
        
        # If no wall hit, draw full length green beam (infinite distance detected)
        end_x = self.x + self.sensor_range * math.cos(beam_angle_rad)
        end_y = self.y + self.sensor_range * math.sin(beam_angle_rad)
        pygame.draw.line(screen, GREEN, (self.x, self.y), (end_x, end_y), 1)

def main():
    # Initialize pygame
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Robot Maze Simulation")
    clock = pygame.time.Clock()
    
    # Create maze and robot
    maze = Maze(SCREEN_WIDTH, SCREEN_HEIGHT)
    
    # Place robot in a valid position (not inside a wall)
    valid_position = False
    while not valid_position:
        robot_x = random.randint(50, SCREEN_WIDTH - 50)
        robot_y = random.randint(50, SCREEN_HEIGHT - 50)
        if not maze.is_wall(robot_x, robot_y):
            valid_position = True
    
    robot = Robot(robot_x, robot_y, maze)
    
    # Main game loop
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        # Update robot
        robot.update()
        
        # Draw everything
        screen.fill(WHITE)
        maze.draw(screen)
        robot.draw(screen)
        
        pygame.display.flip()
        clock.tick(FPS)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()