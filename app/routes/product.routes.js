const authJwt = require("../middlewares/authJwt.js");
module.exports = products => {
  const authJwt = require("../middlewares/authJwt.js")
  const Products = require("../controllers/product.controller.js");

  var router = require("express").Router();

  // Create a new Product
  router.post("/", Products.create);

  // Retrieve all Products
  router.get("/", Products.findAll);

  // Retrieve all published Products
  router.get("/category/:category", Products.getProductsByCategory);
  // Retrieve all published Products
  router.get("/brand/:brand", Products.getProductsByBrand);

  // Retrieve a single Product with id
  router.get("/:id", Products.findByID);

  // Retrieve a single Product with id
  router.get("/search/:searchQuery", Products.getProductsBySearchQuery);

  // Update a Product with id
  router.put("/:id",[authJwt.verifyToken], Products.update);

  // Delete a Product with id
  router.delete("/:id",[authJwt.verifyToken], Products.delete);


  products.use("/api/products", router);
};
