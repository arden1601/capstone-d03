from setuptools import setup

package_name = 'wall_detector_robot'

setup(
    name=package_name,
    version='0.0.1',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/wall_detector.launch.py']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='yourname',
    description='Wall detector robot using turtlesim',
    entry_points={
        'console_scripts': [
            'wall_detector = wall_detector_robot.wall_detector:main',
            'wall_map = maps.wall_map:main',
        ],
    },
)
