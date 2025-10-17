# launch/wall_detector.launch.py

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='turtlesim', executable='turtlesim_node', name='sim'),
        Node(package='wall_detector_robot', executable='wall_map', name='wall_map'),
        Node(package='wall_detector_robot', executable='wall_detector', name='wall_detector'),
    ])
