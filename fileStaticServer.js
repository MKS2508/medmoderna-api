const express = require("express");
const compression = require("compression");
const app = express();

// Configura el middleware para comprimir archivos estáticos
app.use(compression());

// Configura el middleware para servir archivos estáticos y mostrar un mensaje de error si algo sale mal
app.use("/static", express.static("public", {
    fallthrough: false,
    setHeaders: function (res, path, stat) {
        res.set('Cache-Control', 'public, max-age=3600');
    }
}), function (err, req, res, next) {
    console.error("Error al servir archivos estáticos:", err);
    res.status(404).send("Archivo no encontrado");
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
