import matplotlib.pyplot as plt
import numpy as np

class Robot:
    def __init__(self, x, y, orientation):
        self.x = x
        self.y = y
        self.orientation = orientation  # 0: Utara, 1: Timur, 2: Selatan, 3: Barat

    def move(self):
        if self.orientation == 0:  # Utara
            self.y += 1
        elif self.orientation == 1:  # Timur
            self.x += 1
        elif self.orientation == 2:  # Selatan
            self.y -= 1
        elif self.orientation == 3:  # Barat
            self.x -= 1

    def turn(self):
        self.orientation = (self.orientation + 1) % 4  # Berbelok 90 derajat ke kanan

    def get_position(self):
        return (self.x, self.y)

def detect_distance():
    # Simulasi jarak, misalkan jarak infinite jika berada di jalur
    return float('inf')  # Menggunakan infinity untuk simulasi

def simulate_robot():
    robot = Robot(0, 0, 1)  # Posisi awal (0, 0) menghadap Timur
    path = []

    for _ in range(20):  # Simulasi selama 20 langkah
        distance = detect_distance()
        
        if distance == float('inf'):
            robot.turn()  # Berbelok jika jarak infinite
        else:
            robot.move()  # Melanjutkan bergerak

        path.append(robot.get_position())

    return path

def plot_path(path):
    x, y = zip(*path)
    plt.plot(x, y, marker='o', label='Jalur Robot')
    plt.title('Jalur Robot Melewati Peta')
    plt.xlabel('Posisi X')
    plt.ylabel('Posisi Y')
    plt.grid()
    plt.axis('equal')
    plt.legend()
    plt.show()

# Menjalankan simulasi
robot_path = simulate_robot()
plot_path(robot_path)
