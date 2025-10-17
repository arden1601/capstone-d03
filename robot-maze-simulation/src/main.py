from field import RiceFieldMap, SCREEN_HEIGHT, SCREEN_WIDTH, WHITE, BLACK, FPS
from robot import Robot
import random
import sys
import pygame

def main():
    # Initialize pygame
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Rice Field Robot Simulation")
    clock = pygame.time.Clock()
    
    # Create rice field map and robot
    field_map = RiceFieldMap(SCREEN_WIDTH, SCREEN_HEIGHT)
    
    # Place robot in a valid position (top-left section)
    robot_x = field_map.wall_thickness + 50
    robot_y = field_map.wall_thickness + 50
    
    robot = Robot(robot_x, robot_y, field_map)
    
    # Font for displaying coverage percentage
    font = pygame.font.SysFont(None, 24)
    
    # Main game loop
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    # Reset simulation
                    field_map = RiceFieldMap(SCREEN_WIDTH, SCREEN_HEIGHT)
                    robot = Robot(robot_x, robot_y, field_map)
                elif event.key == pygame.K_r:
                    # Manually place robot in a different section
                    sections = [
                        (field_map.wall_thickness + 50, field_map.wall_thickness + 50),  # Top-left
                        (SCREEN_WIDTH // 2, field_map.wall_thickness + 50),  # Top-middle
                        (SCREEN_WIDTH - field_map.wall_thickness - 50, field_map.wall_thickness + 50),  # Top-right
                        (field_map.wall_thickness + 50, SCREEN_HEIGHT // 2),  # Middle-left
                        (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2),  # Center
                        (SCREEN_WIDTH - field_map.wall_thickness - 50, SCREEN_HEIGHT // 2),  # Middle-right
                        (field_map.wall_thickness + 50, SCREEN_HEIGHT - field_map.wall_thickness - 50),  # Bottom-left
                        (SCREEN_WIDTH // 2, SCREEN_HEIGHT - field_map.wall_thickness - 50),  # Bottom-middle
                        (SCREEN_WIDTH - field_map.wall_thickness - 50, SCREEN_HEIGHT - field_map.wall_thickness - 50)  # Bottom-right
                    ]
                    robot_x, robot_y = random.choice(sections)
                    robot = Robot(robot_x, robot_y, field_map)
        
        # Update robot
        robot.update()
        
        # Draw everything
        screen.fill(WHITE)
        field_map.draw(screen)
        robot.draw(screen)
        
        # Display coverage percentage
        coverage = field_map.get_coverage_percentage()
        coverage_text = font.render(f"Coverage: {coverage:.1f}%", True, BLACK)
        screen.blit(coverage_text, (10, 10))
        
        # Display instructions
        instructions = font.render("Press SPACE to reset, R to randomly reposition robot", True, BLACK)
        screen.blit(instructions, (10, 40))
        
        pygame.display.flip()
        clock.tick(FPS)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()