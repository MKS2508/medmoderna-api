const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();


// ... tus otros middlewares (bodyParser, etc.)




const app = express();
const initialSetup = require("./app/libs/initialSetup")

const corsOptions = {
  origin: '*',
  // origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.150:3000"],
    credentials: false

};
initialSetup.createProductCategories().then();
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));
// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '100mb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


// Configura el middleware para servir archivos estáticos comprimidos
app.use(compression());


// Configura el middleware para servir archivos estáticos y mostrar un mensaje de error si algo sale mal
app.use("/api/static", express.static("public", {
    fallthrough: false,
    setHeaders: function (res, path, stat) {
        res.set('Cache-Control', 'public, max-age=3600');
    }
}), function (err, req, res, next) {
    console.error("Error al servir archivos estáticos:", err);
    res.status(404).send("Archivo no encontrado");
});

// ... tus rutas (app.get, require, etc.)
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to medicina moderna REST-API application." });
});

require("./app/routes/product.routes")(app);
require("./app/routes/auth.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
