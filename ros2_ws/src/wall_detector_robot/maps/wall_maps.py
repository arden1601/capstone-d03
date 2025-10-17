# maps/wall_map.py

import rclpy
from turtlesim.srv import TeleportAbsolute
from geometry_msgs.msg import Twist
import time

def draw_walls(node):
    pub = node.create_publisher(Twist, '/turtle1/cmd_vel', 10)
    time.sleep(1)

    cmd = Twist()
    cmd.linear.x = 2.0

    for _ in range(4):  # bentuk kotak
        pub.publish(cmd)
        time.sleep(2)
        cmd.linear.x = 0.0
        cmd.angular.z = 1.57
        pub.publish(cmd)
        time.sleep(1)

def main(args=None):
    rclpy.init(args=args)
    node = rclpy.create_node('wall_map_node')
    draw_walls(node)
    node.destroy_node()
    rclpy.shutdown()
