import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.patches as patches

# Constants for the simulation
robot_radius = 1  # Radius of the robot
wheel_radius = 0.5  # Radius of the wheels
wheel_base = 3    # Distance between the wheels (in meters)
robot_speed = 0.2 # Speed of the robot in units per step
num_steps = 200   # Number of steps for the animation

# Define the robot movement path
path = [(-2, -2), (-2, 2), (2, 2), (2, 6)]  # Points the robot will travel through
turns = [(90, 'right'), (90, 'left')]  # Turns at specific points (angle, direction)

# Initialize the plot
fig, ax = plt.subplots()
ax.set_xlim(-10, 20)
ax.set_ylim(-10, 20)

# Create the robot body as a rectangle (simplified shape)
robot_body = patches.Rectangle((-2 - robot_radius, -2 - robot_radius), robot_radius * 2, robot_radius * 2, fc='grey', ec='black')
ax.add_patch(robot_body)

# Wheels
left_wheel = patches.Circle((-2 - wheel_base / 2, -2), wheel_radius, fc='blue', ec='black')
right_wheel = patches.Circle((-2 + wheel_base / 2, -2), wheel_radius, fc='red', ec='black')
ax.add_patch(left_wheel)
ax.add_patch(right_wheel)

# Path lists for wheel trajectories
left_wheel_path = []
right_wheel_path = []

# Robot's current position and orientation
x, y, theta = -2, -2, 0  # Starting position and orientation (theta is 0)

# Function to update the robot's position and the path
def update(frame):
    global x, y, theta, left_wheel, right_wheel, robot_body
    
    # Default speed for straight movement
    left_speed = robot_speed
    right_speed = robot_speed

    # Move the robot along the path
    if frame < num_steps // 5:  # Move straight from (-2, -2) to (-2, 2)
        delta_x = 0
        delta_y = robot_speed
        left_speed = right_speed = robot_speed  # Both wheels move forward

    elif frame < 2 * num_steps // 5:  # Turn right at (-2, 2)
        delta_x = 0
        delta_y = 0  # No movement during turn, just rotate

        # Right turn: Left wheel forward, Right wheel backward
        left_speed = robot_speed
        right_speed = -robot_speed
        
        # Update orientation for right turn
        theta -= 90 / (num_steps // 5)  # Incremental right turn

    elif frame < 3 * num_steps // 5:  # Move straight from (-2, 2) to (2, 2)
        delta_x = robot_speed
        delta_y = 0
        left_speed = right_speed = robot_speed  # Both wheels move forward

    elif frame < 4 * num_steps // 5:  # Turn left at (2, 2)
        delta_x = 0
        delta_y = 0  # No movement during turn, just rotate

        # Left turn: Right wheel forward, Left wheel backward
        left_speed = -robot_speed
        right_speed = robot_speed
        
        # Update orientation for left turn
        theta += 90 / (num_steps // 5)  # Incremental left turn

    else:  # Move straight from (2, 2) to (2, 6)
        delta_x = 0
        delta_y = robot_speed
        left_speed = right_speed = robot_speed  # Both wheels move forward

    # Update the robot's position based on its motion
    x += delta_x
    y += delta_y
    robot_body.set_xy((x - robot_radius, y - robot_radius))  # Update robot position

    # Update wheel positions based on robot's orientation
    left_wheel_center = (x - wheel_base / 2 * np.cos(np.radians(theta)), y - wheel_base / 2 * np.sin(np.radians(theta)))
    right_wheel_center = (x + wheel_base / 2 * np.cos(np.radians(theta)), y + wheel_base / 2 * np.sin(np.radians(theta)))

    left_wheel.set_center(left_wheel_center)
    right_wheel.set_center(right_wheel_center)

    # Update the paths for the left and right wheels
    left_wheel_path.append(left_wheel_center)
    right_wheel_path.append(right_wheel_center)

    # Clear the previous paths
    ax.clear()
    ax.set_xlim(-10, 20)
    ax.set_ylim(-10, 20)
    
    # Draw the path for the left and right wheels
    left_wheel_path_array = np.array(left_wheel_path)
    right_wheel_path_array = np.array(right_wheel_path)
    ax.plot(left_wheel_path_array[:, 0], left_wheel_path_array[:, 1], 'b-', label="Left Wheel Path")
    ax.plot(right_wheel_path_array[:, 0], right_wheel_path_array[:, 1], 'r-', label="Right Wheel Path")
    
    # Add the robot body and wheels
    ax.add_patch(robot_body)
    ax.add_patch(left_wheel)
    ax.add_patch(right_wheel)

    # Add the text displaying wheel speeds
    ax.text(-9, 17, f"Left Wheel Speed: {left_speed:.2f}", fontsize=12, color='blue')
    ax.text(-9, 15, f"Right Wheel Speed: {right_speed:.2f}", fontsize=12, color='red')
    ax.legend()

# Create the animation
ani = FuncAnimation(fig, update, frames=num_steps, interval=100, repeat=False)

plt.show()