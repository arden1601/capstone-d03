import pygame
import math
import time

pygame.init()
WIDTH, HEIGHT = 1000, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Wall Following with PID Control")
clock = pygame.time.Clock()

# Track setup
track = pygame.Surface((WIDTH, HEIGHT))
track.fill((255, 255, 255))  # background putih

track_path = [
    (200, 150), (800, 150),
    (800, 200), (850, 300), (800, 400),
    (800, 450), (200, 450),
    (200, 400), (150, 300), (200, 200),
    (200, 150)
]
pygame.draw.lines(track, (0, 0, 0), False, track_path, 10)

# Robot setup
robot_x, robot_y = 210, 300
angle = 0
speed = 2
sensor_side_distance = 30  # jarak sensor samping
sensor_front_distance = 40

# PID parameters
Kp = 0.008
Ki = 0.0001
Kd = 0.002

integral = 0
prev_error = 0
prev_time = time.time()

def get_distance_to_wall(x, y, angle, max_distance=60):
    for dist in range(max_distance):
        check_x = int(x + math.cos(angle) * dist)
        check_y = int(y + math.sin(angle) * dist)
        if check_x < 0 or check_x >= WIDTH or check_y < 0 or check_y >= HEIGHT:
            return max_distance
        color = track.get_at((check_x, check_y))
        if color == pygame.Color(0, 0, 0):
            return dist
    return max_distance

def draw_robot(x, y, angle):
    pygame.draw.circle(screen, (0, 100, 255), (int(x), int(y)), 12)

    left_angle = angle + math.pi / 2
    right_angle = angle - math.pi / 2
    front_angle = angle

    # Sensor positions for visualization
    left_sx = x + math.cos(left_angle) * sensor_side_distance
    left_sy = y + math.sin(left_angle) * sensor_side_distance
    right_sx = x + math.cos(right_angle) * sensor_side_distance
    right_sy = y + math.sin(right_angle) * sensor_side_distance
    front_sx = x + math.cos(front_angle) * sensor_front_distance
    front_sy = y + math.sin(front_angle) * sensor_front_distance

    # Draw sensor dots
    pygame.draw.circle(screen, (255, 0, 0), (int(left_sx), int(left_sy)), 5)
    pygame.draw.circle(screen, (0, 255, 0), (int(right_sx), int(right_sy)), 5)
    pygame.draw.circle(screen, (255, 255, 0), (int(front_sx), int(front_sy)), 5)

    left_dist = get_distance_to_wall(x, y, left_angle)
    right_dist = get_distance_to_wall(x, y, right_angle)
    front_dist = get_distance_to_wall(x, y, front_angle)

    return left_dist, right_dist, front_dist

running = True
while running:
    screen.blit(track, (0, 0))

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    left_dist, right_dist, front_dist = draw_robot(robot_x, robot_y, angle)

    # PID control for angle correction based on side distance error
    error = left_dist - right_dist

    current_time = time.time()
    dt = current_time - prev_time if current_time - prev_time > 0 else 1e-16

    integral += error * dt
    derivative = (error - prev_error) / dt

    correction = Kp * error + Ki * integral + Kd * derivative

    prev_error = error
    prev_time = current_time

    # Safety check front sensor: slow down or stop if too close
    if front_dist < 20:
        current_speed = max(0.5, speed * (front_dist / 20))  # slow down proportionally
    else:
        current_speed = speed

    angle -= correction  # adjust heading angle with correction

    # Move robot forward
    robot_x += current_speed * math.cos(angle)
    robot_y += current_speed * math.sin(angle)

    # Draw robot heading line
    heading_length = 25
    heading_x = robot_x + math.cos(angle) * heading_length
    heading_y = robot_y + math.sin(angle) * heading_length
    pygame.draw.line(screen, (255, 0, 0), (robot_x, robot_y), (heading_x, heading_y), 3)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
