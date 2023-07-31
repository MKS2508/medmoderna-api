# Etapa de construcción
FROM node:latest AS build

WORKDIR /app

# Clona el repositorio
RUN git clone https://github.com/MKS2508/medmoderna-api.git .

# Instala las dependencias del proyecto
RUN npm install

# Etapa de producción
FROM node:14-alpine

WORKDIR /app

# Instala PM2 globalmente
RUN npm install -g pm2

# Copia desde la etapa de construcción
COPY --from=build /app .

# Expone el puerto 5000
EXPOSE 5000

# Levanta la aplicación con PM2
CMD ["pm2-runtime", "start", "server.js"]
LABEL authors="MKS2508"
