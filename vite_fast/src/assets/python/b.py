import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import gamma

# θ固定
theta = 0.5
k_values = [2/9, 2/3, 2, 6, 18]
colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE']

# x軸の設定
x = np.linspace(0, 15, 1000)

# グラフ描画
plt.figure(figsize=(10, 6))
for k, color in zip(k_values, colors):
    y = gamma.pdf(x, a=k, scale=theta)
    label = f"k = {k:.4f}" if k == 2/9 else f"k = {k:.3f}" if k == 2/3 else f"k = {k:.1f}"
    plt.plot(x, y, label=label, color=color)

plt.title("Gamma Distribution (θ = 0.5)")
plt.xlabel("x")
plt.ylabel("f(x)")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()

# 統計情報の出力
print("k値\t期待値 E[X]=kθ\t分散 Var[X]=kθ²")
for k in k_values:
    mean = k * theta
    var = k * theta**2
    label = f"{k:.4f}" if k == 2/9 else f"{k:.3f}" if k == 2/3 else f"{k:.1f}"
    print(f"{label}\t{mean:.4f}\t\t{var:.4f}")
