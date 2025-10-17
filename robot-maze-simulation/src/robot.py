from field import RED, GREEN, LIGHT_BLUE, BLACK,BLUE,BROWN,GRAY,YELLOW
import random
import math
import pygame

class Robot:
    def __init__(self, x, y, field_map):
        self.x = x
        self.y = y
        self.angle = 0  # Facing right initially
        self.speed = 2.5
        self.rotation_speed = 3
        self.maze = field_map
        self.radius = 30
        
        # Ultrasonic sensors 
        self.sensor_range = 100
        self.left_sensor_active = False
        self.right_sensor_active = False
        self.left_sensor_distance = 30
        self.right_sensor_distance = 30
        
        # Path history for visualization
        self.path = []
        self.path_max_length = 200
    
    def update(self):
        # Check sensors
        self.left_sensor_active, self.left_sensor_distance = self.check_sensor(-30)  # Left sensor
        self.right_sensor_active, self.right_sensor_distance = self.check_sensor(30)  # Right sensor
        
        # Add current position to path
        self.path.append((self.x, self.y))
        if len(self.path) > self.path_max_length:
            self.path.pop(0)
        
        # Navigation logic based on ultrasound readings
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
        
        # Update coverage
        self.maze.update_coverage(self.x, self.y)
    
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
                return False, distance
        
        # No collision within range (infinite)
        return True, float('inf')
    
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
        # Draw path
        if len(self.path) > 1:
            pygame.draw.lines(screen, (100, 100, 255), False, self.path, 2)
        
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