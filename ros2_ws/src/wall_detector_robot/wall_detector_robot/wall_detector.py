# wall_detector_robot/wall_detector.py

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import random

class WallDetector(Node):
    def __init__(self):
        super().__init__('wall_detector')
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.timer = self.create_timer(0.5, self.control_loop)
        self.wall_distance = 1.0  # jarak default ke dinding
        self.direction = 'kanan'  # bisa diubah ke 'kiri'

    def control_loop(self):
        msg = Twist()

        # Simulasi pembacaan sensor ultrasonic
        if self.wall_distance == float('inf'):
            self.get_logger().info('Corner detected! Turning...')
            if self.direction == 'kanan':
                msg.angular.z = -1.5
            elif self.direction == 'kiri':
                msg.angular.z = 1.5
        else:
            msg.linear.x = 2.0  # maju

        self.publisher.publish(msg)

        # Simulasi jarak berubah acak
        self.wall_distance = random.choice([1.0, 0.5, float('inf')])  # kadang corner

def main(args=None):
    rclpy.init(args=args)
    node = WallDetector()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
