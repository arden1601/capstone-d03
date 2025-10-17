import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.patches as patches

# Constants
L1, L2 = 1.0, 1.0              # Arm link lengths
M1, M2 = 2.0, 1.5              # Link masses
g = 9.81
dt = 0.05

# Platform dimensions
platform_width = 1.5
platform_height = 0.3
wheel_radius = 0.2
wheel_offset = 0.6  # from center

# PID controller for nozzle height
class PID:
    def __init__(self, Kp, Ki, Kd):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.integral = 0
        self.prev_error = 0

    def update(self, target, current):
        error = target - current
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        self.prev_error = error
        return self.Kp * error + self.Ki * self.integral + self.Kd * derivative

# Terrain function
def road_profile(x):
    return 0.2 * np.sin(0.8 * x)

# Initial joint states
theta1, theta2 = np.radians([60, -60])  # Initial joint angles
theta1_dot, theta2_dot = 0, 0
theta1_target = np.radians(20)
theta2_target = np.radians(0)

# PID controllers for both joints
pid1 = PID(Kp=200, Ki=3, Kd=0.1)
pid2 = PID(Kp=200, Ki=3, Kd=0.2)



# Set the target height of the nozzle
target_nozzle_height = 1.2  # Adjust to desired height

# Plot setup
fig, ax = plt.subplots()
ax.set_xlim(-1, 11)
ax.set_ylim(-1, 5)
ax.set_aspect('equal')
ax.set_title("2DOF Arm on Bumpy Mobile Robot with PID for Nozzle Height")

# Elements to animate
line, = ax.plot([], [], 'o-', lw=4, color='blue')  # Static arm
line_controlled, = ax.plot([], [], 'o-', lw=4, color='red')  # Controlled arm with PID
text = ax.text(0.5, 2.5, '', fontsize=10)

# Add robot parts
platform = patches.Rectangle((0, 0), platform_width, platform_height, fc='gray')
wheel_left = patches.Circle((0, 0), wheel_radius, fc='black')
wheel_right = patches.Circle((0, 0), wheel_radius, fc='black')
ax.add_patch(platform)
ax.add_patch(wheel_left)
ax.add_patch(wheel_right)

# Ground terrain
terrain_x = np.linspace(-1, 10, 500)
terrain_y = road_profile(terrain_x)
terrain_line, = ax.plot(terrain_x, terrain_y, 'g-', lw=2)

# Forward kinematics to calculate nozzle height
def forward_kinematics(theta1, theta2, base_x, base_y):
    # Adjust base for attachment at the top-center of the platform
    x1 = base_x + L1 * np.cos(theta1)
    y1 = base_y + L1 * np.sin(theta1)
    x2 = x1 + L2 * np.cos(theta1 + theta2)
    y2 = y1 + L2 * np.sin(theta1 + theta2)
    return x1, y1, x2, y2

# Update function
def update(frame):
    global theta1, theta2, theta1_dot, theta2_dot

    t = frame * dt
    base_x = 0.5 + 0.02 * frame  # move forward
    x_back = base_x - wheel_offset
    x_front = base_x + wheel_offset
    y_back = road_profile(x_back)
    y_front = road_profile(x_front)

    # Platform tilt
    dx = x_front - x_back
    dy = y_front - y_back
    tilt_angle = np.arctan2(dy, dx)
    base_y = ((y_back + y_front) / 2) + wheel_radius

    # PID control for keeping nozzle height constant
    # Calculate current nozzle height from forward kinematics
    _, y1, _, y2 = forward_kinematics(theta1, theta2, base_x, base_y)
    current_nozzle_height = y2  # Nozzle height is the end-effector's y-position

    # PID updates for both joints based on the nozzle height error
    tau1 = pid1.update(target_nozzle_height, current_nozzle_height)
    tau2 = pid2.update(target_nozzle_height, current_nozzle_height)

    # Dynamics for controlled arm
    alpha1 = tau1 - g * np.sin(theta1)
    alpha2 = tau2 - g * np.sin(theta1 + theta2)
    theta1_dot += alpha1 * dt
    theta2_dot += alpha2 * dt
    theta1 += theta1_dot * dt
    theta2 += theta2_dot * dt

    # Arm kinematics for both arms (controlled and static)
    x1, y1, x2, y2 = forward_kinematics(theta1, theta2, base_x, base_y)
    line_controlled.set_data([base_x, x1, x2], [base_y, y1, y2])

    # Static arm: without PID control, just follow the natural kinematics
    static_theta1 = np.radians(45)
    static_theta2 = np.radians(-45)
    x1_static, y1_static, x2_static, y2_static = forward_kinematics(static_theta1, static_theta2, base_x, base_y)
    line.set_data([base_x, x1_static, x2_static], [base_y, y1_static, y2_static])

    # Move and rotate platform
    platform.set_xy((base_x - platform_width / 2, base_y))
    platform.angle = np.degrees(tilt_angle)

    # Wheels follow terrain
    wheel_left.center = (x_back, y_back + wheel_radius)
    wheel_right.center = (x_front, y_front + wheel_radius)

    text.set_text(f"x: {base_x:.2f}\nNozzle Height: {current_nozzle_height:.2f}\nNozzle Height without PID: {y2_static:.2f}")

    return line, line_controlled, platform, wheel_left, wheel_right, terrain_line, text

# Animate
ani = FuncAnimation(fig, update, frames=300, interval=70, blit=False)
plt.show()
  