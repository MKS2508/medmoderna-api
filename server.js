const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const app = express();
const initialSetup = require("./app/libs/initialSetup")

const corsOptions = {
    //origin: '*',
    origin: ["https://medmoderna.vercel.app","http://www.medicinamodernagrow.shop", "https://www.medicinamodernagrow.shop","http://127.0.0.1:3000", "http://192.168.1.150:3000", "http://93.93.118.47:80", "https://93.93.118.47:443", "http://93.93.118.47"],
    credentials: true
};
initialSetup.createProductCategories().then();
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use(bodyParser.json({ limit: '100mb' }));
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

app.use(compression());

app.use("/api/static", express.static("public", {
    fallthrough: false,
    setHeaders: function (res, path, stat) {
        res.set('Cache-Control', 'public, max-age=3600');
    }
}), function (err, req, res, next) {
    console.error("Error al servir archivos estáticos:", err);
    res.status(404).send("Archivo no encontrado");
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to medicina moderna REST-API application." });
});

require("./app/routes/product.routes")(app);
require("./app/routes/auth.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;

// Configura HTTPS y las rutas SSL
const httpsOptions = {
    key: fs.readFileSync('./_.medicinamodernagrow.key'), // clave privada
    cert: fs.readFileSync('./medicinamodernagrow.cer') // certificado
}


const server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
