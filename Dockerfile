# Utiliza una imagen base de Node.js 14
FROM node:14

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo package.json al directorio de trabajo
COPY package.json ./

# Instala pm2 de manera global y las dependencias del proyecto
RUN npm -g install pm2
RUN npm install

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto 3000 para que la aplicación sea accesible desde fuera del contenedor
EXPOSE 3000

# Inicia la aplicación usando pm2-runtime
CMD ["pm2-runtime", "server.js"]
