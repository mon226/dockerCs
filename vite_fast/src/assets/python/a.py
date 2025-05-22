import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import beta

# 定義域 [0, 2]
x = np.linspace(0, 2, 500)

# Beta(3,3) 分布をスケーリング
alpha, beta_param = 5, 5
x_scaled = x / 2  # [0, 2] -> [0, 1] にスケーリング
y = beta.pdf(x_scaled, alpha, beta_param)

# 正規化（最大値を1にスケーリング）
y = y / np.max(y)

# プロット
plt.figure(figsize=(8, 4))
plt.plot(x, y, label=r'$\mathrm{Beta}(3,3)$ scaled to [0, 2]', color='blue')
plt.title("Beta(3, 3) Distribution Scaled to [0, 2]")
plt.xlabel("x")
plt.ylabel("f(x)")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()
