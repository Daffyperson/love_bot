# Используем официальный образ Node.js
FROM node:18

# Создаём рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы бота
COPY . .

# Указываем команду запуска
CMD ["node", "index.js"]
