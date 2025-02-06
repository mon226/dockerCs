FROM node:18

WORKDIR /app

COPY vite_fast/ ./

RUN apt-get update && apt-get install -y \
    # 必要なパッケージをここに追加
    # 例: git, curl など \
    && rm -rf /var/lib/apt/lists/*

CMD ["npm", "run", "dev", "--", "--host"]

