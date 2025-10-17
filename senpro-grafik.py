import matplotlib.pyplot as plt
import numpy as np

# Data
normalized_time = np.array([0.2, 0.4, 0.6, 0.8, 1.0])
cumulative_failure_count = np.array([1, 2, 3, 4, 5])

# Membuat plot
plt.figure(figsize=(10, 6))
plt.plot(normalized_time, cumulative_failure_count, marker='o')

# Menambahkan label dan judul
plt.xlabel('Normalized Time')
plt.ylabel('Cumulative Failure Count')
plt.title('Reliability Demonstration Chart')

# Menampilkan grid
plt.grid(True)

# Menampilkan plot
plt.show()
