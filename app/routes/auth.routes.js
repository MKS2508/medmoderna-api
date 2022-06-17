module.exports = auth => {
  const Products = require("../controllers/product.controller.js");
  const { register , login } = require("../controllers/auth.controller.js");

  var router = require("express").Router();

  router.route('/register').post(register)
  router.route('/login').post(login)

  auth.use("/api/auth", router);
};
