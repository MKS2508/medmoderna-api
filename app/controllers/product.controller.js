const db = require("../models");
const Product = db.Products;
const productCategory = db.productCategory;
const imageToBase64 = require('image-to-base64');
//aaa
//helper paginacion
const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return {limit, offset};
};

// CREA PRODUCTO
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({message: "Content can not be empty!"});
        return;
    }

    // Create a Product
    let imgBase64 = await imageToBase64(req.body.imgSrc);
    let category = await productCategory.findOne({name: req.body.category})
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        brand: req.body.brand,
        category: category,
        productId: req.body.productId,
        imgSrc: imgBase64
    });

    try {
        const saveProduct = await product.save(product);
        res.send(saveProduct);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Product.",
        });
    }


    // Save Product in the database

};

// DEVUELVE TODOS LOS PRODUCTOS
exports.findAll = async (req, res) => {
    const {page, size, title} = req.query;
    var condition = title
        ? {title: {$regex: new RegExp(title), $options: "i"}}
        : {};

    const {limit, offset} = getPagination(page, size);
    try {
        const productPaginate = await Product.paginate(condition, {offset, limit});
        res.send({
            totalItems: productPaginate.totalDocs,
            products: productPaginate.docs.map((item) => {
                item.category = category.name
            }),
            totalPages: productPaginate.totalPages,
            currentPage: productPaginate.page - 1,
        });
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving Products.",
        });

    }


};

// DEVUELVE PRODUCTOS POR ID
exports.findByID = async (req, res) => {
    console.log("a")

    const id = req.params.id;

    try {
        console.log({id})
        const product = await Product.findOne({productId: id});
        if (product.id !== null && product.id !== undefined) {
            let cat = await productCategory.findById(product.category);
            product.category.name = cat.name;
            let productFixed = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category.name,
                productId: product.productId,
                brand: product.brand,
                imgSrc: product.imgSrc
            };

            res.send(productFixed);
        } else {
            res.status(404).send({message: "Not found Product with id " + id});

        }
    } catch (err) {
        res
            .status(500)
            .send({message: "Error retrieving Product with id=" + id});
    }


};

// DEVUELVE PRODUCTOS POR CATEGORIA
exports.getProductsByCategory = async (req, res) => {
    const {page, size} = req.query;
    const {limit, offset} = getPagination(page, size);
    const cat = await productCategory.findOne({name: req.params.category});
    const fixProducts = async (productPaginate) => {

        let products = productPaginate.docs
        let productsFixed = [];
        console.log({cat2: cat})
        products.map(async (product) => {
            let productFixed = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: {
                    name: cat.name,
                    totalProducts: productPaginate.totalDocs
                },
                productId: product.productId,
                brand: product.brand,
                imgSrc: product.imgSrc
            };
            productsFixed.push(productFixed);
        })
        return productsFixed;
    }
    try {

        try {
            const productPaginate = await Product.paginate({category: cat}, {offset, limit});
            const products = await fixProducts(productPaginate);
            res.send({
                totalItems: productPaginate.totalDocs,
                products,
                totalPages: productPaginate.totalPages,
                currentPage: productPaginate.page - 1,
            });
        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving products.",
            });
        }
    } catch (e) {
        res.status(500).send({
            message:
                e.message || "Some error occurred while retrieving products.",
            message2: "Some error occurred in category" + req.params.category,
        });
    }


};

// DEVUELVE PRODUCTOS POR CATEGORIA
exports.getProductsByBrand = async (req, res) => {
    const {page, size} = req.query;
    const {limit, offset} = getPagination(page, size);
    try {
        const brand = req.params.brand;
        if (brand.length < 1) return;
        try {
            const productPaginate = await Product.paginate({brand: brand}, {offset, limit});
            let products = productPaginate.docs
            let productsFixed = [];
            products.map(async (product, index) => {
                const cat = await productCategory.findById(product.category);
                let productFixed = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: {
                        name: cat.name,
                        totalProducts: productPaginate.totalDocs
                    },
                    productId: product.productId,
                    brand: product.brand,
                    imgSrc: product.imgSrc
                };
                productsFixed.push(productFixed);
                console.log({index})
                if (index === products.length - 1) {
                    res.send({
                        totalItems: productPaginate.totalDocs,
                        products: productsFixed,
                        totalPages: productPaginate.totalPages,
                        currentPage: productPaginate.page - 1,
                    });
                }
            })


        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving products.",
            });
        }
    } catch (e) {
        res.status(500).send({
            message:
                e.message || "Some error occurred while retrieving products.",
            message2: "Some error occurred in category" + req.params.category,
        });
    }


};

// DEVUELVE PRODUCTOS POR CATEGORIA
exports.getProductsBySearchQuery = async (req, res) => {
    const {page, size} = req.query;
    const {limit, offset} = getPagination(page, size);
    try {
        const query = req.params.searchQuery;
        if (brand.length < 1) return;
        try {
            const productPaginate = await Product.paginate({name: `/${query}/i`}, {offset, limit});
            let products = productPaginate.docs
            let productsFixed = [];
            products.map(async (product, index) => {
                const cat = await productCategory.findById(product.category);
                let productFixed = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: {
                        name: cat.name,
                        totalProducts: productPaginate.totalDocs
                    },
                    productId: product.productId,
                    brand: product.brand,
                    imgSrc: product.imgSrc
                };
                productsFixed.push(productFixed);
                console.log({index})
                if (index === products.length - 1) {
                    res.send({
                        totalItems: productPaginate.totalDocs,
                        products: productsFixed,
                        totalPages: productPaginate.totalPages,
                        currentPage: productPaginate.page - 1,
                    });
                }
            })


        } catch (err) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving products.",
            });
        }
    } catch (e) {
        res.status(500).send({
            message:
                e.message || "Some error occurred while retrieving products.",
            message2: "Some error occurred in category" + req.params.category,
        });
    }


};

// ACTUALIZA PRODUCTO POR ID
exports.update = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
        });
    }

    const id = req.params.id;

    try {
        const product = await Product.findByIdAndUpdate(id, req.body, {useFindAndModify: false});
        if (product.id !== null && product.id !== undefined) {
            res.status(404).send({
                message: `Cannot update Product with id=${id}. Maybe Product was not found!`,
            });
        } else res.send(product);
    } catch (e) {
        res.status(500).send({
            message: "Error updating Product with id=" + id,
        });
    }

};

// ELIMINA PRODUCTO POR ID
exports.delete = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
        });
    }

    const id = req.params.id;

    try {
        const product = await Product.findByIdAndRemove(id, {useFindAndModify: false});
        if (product.id !== null && product.id !== undefined) {
            res.status(404).send({
                message: `Cannot delete Product with id=${id}. Maybe Product was not found!`,
            });
        } else res.send(product);
    } catch (e) {
        res.status(500).send({
            message: "Error deleting Product with id=" + id,
        });
    }

};

