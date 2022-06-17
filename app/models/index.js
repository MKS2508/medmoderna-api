const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.Products = require("./product.model.js")(mongoose, mongoosePaginate);
db.productCategory = require("./category.model.js")(mongoose);
db.User = require("./user.model.js")(mongoose);

module.exports = db;
