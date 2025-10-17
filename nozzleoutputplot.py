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
pid1 = PID(Kp=200, Ki=2, Kd=0.3)
pid2 = PID(Kp=200, Ki=2, Kd=0.2)

# Set the target height of the nozzle
target_nozzle_height = 1.2  # Adjust to desired height

# Forward kinematics to calculate nozzle height
def forward_kinematics(theta1, theta2, base_x, base_y):
    # Adjust base for attachment at the top-center of the platform
    x1 = base_x + L1 * np.cos(theta1)
    y1 = base_y + L1 * np.sin(theta1)
    x2 = x1 + L2 * np.cos(theta1 + theta2)
    y2 = y1 + L2 * np.sin(theta1 + theta2)
    return x1, y1, x2, y2

# Collecting nozzle height response
nozzle_heights = []
nozzle_heights_pid = []

# Simulation loop to collect nozzle height values (for 100 seconds)
num_frames = int(100 / dt)  # 100 seconds of simulation
for frame in range(num_frames):
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

    # Collecting nozzle heights for plotting
    nozzle_heights_pid.append(y2)
    
    # Static arm (without PID): use fixed joint angles
    static_theta1 = np.radians(45)
    static_theta2 = np.radians(-45)
    x1_static, y1_static, x2_static, y2_static = forward_kinematics(static_theta1, static_theta2, base_x, base_y)
    nozzle_heights.append(y2_static)

# Plotting nozzle heights
plt.figure(figsize=(10, 12))
plt.plot(np.arange(num_frames) * dt, nozzle_heights, label='Nozzle Height (Static)', color='blue')
plt.plot(np.arange(num_frames) * dt, nozzle_heights_pid, label='Nozzle Height with PID', color='red')
plt.title("Nozzle Heights of the System")
plt.xlabel("Time (s)")
plt.ylabel("Nozzle Height (m)")
plt.legend()
plt.grid(True)
plt.show()
