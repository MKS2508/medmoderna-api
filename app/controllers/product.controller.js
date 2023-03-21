const db = require("../models");
const Product = db.Products;
const productCategory = db.productCategory;
const imageToBase64 = require('image-to-base64');
const gis = require('async-g-i-s');
const formidable = require('formidable');

//aaa
//helper paginacion
const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return {limit, offset};
};

// CREA PRODUCTO
exports.create = async (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).send({ message: "Error processing form data." });
        }

        if (!fields.name) {
            res.status(400).send({ message: "Content can not be empty!" });
            return;
        }

        const productData = fields;

        try {
            productData.imgSrc = await processImageField(productData.imgSrc);
            productData.imgSrc2 = await processImageField(productData.imgSrc2);
        } catch (error) {
            return res.status(400).send({ message: "Error processing image data." });
        }

        let category = await productCategory.findOne({ name: productData.category });
        const product = new Product({
            ...productData,
            category: category,
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
    });
};

// DEVUELVE TODOS LOS PRODUCTOS
exports.findAll = async (req, res) => {
    const {title, page, size} = req.query;
    const pageNumber = parseInt(page) + 0; // Incrementa en 1 el valor de la página
    const {limit, offset} = getPagination(pageNumber, size);

    const condition = title
        ? {title: {$regex: new RegExp(title), $options: "i"}}
        : {};

    const fixProducts = async (productPaginate) => {
        let products = productPaginate.docs;
        let productsFixed = [];

        products.map((product) => {
            let productFixed = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category ? product.category.name : "CBD",
                productId: product.productId,
                brand: product.brand,
                imgSrc: product.imgSrc,
            };
            productsFixed.push(productFixed);
        });

        return productsFixed;
    };

    try {
        const productPaginate = await Product.paginate(condition, {
            offset,
            limit,
            populate: 'category', // Agrega esta línea para poblar la información de la categoría
        });
        const productsFixed = await fixProducts(productPaginate);

        res.send({
            totalItems: productPaginate.totalDocs,
            products: productsFixed,
            totalPages: productPaginate.totalPages,
            currentPage: productPaginate.page - 1,
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving products.",
        });
    }

};


// DEVUELVE TODOS LOS PRODUCTOS
exports.getRelatedImages = async (req, res) => {
    const title = req.params.title;
    console.log({title})
    const results = await gis(title);
    console.log(results.slice(0, 10));
    let images = results.slice(0,10)
    try {
        res.send({
            images:images
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

// DEVUELVE PRODUCTOS POR BUSQUEDA
exports.getProductsBySearchQuery = async (req, res) => {
    const {page, size} = req.query;
    const {limit, offset} = getPagination(page, size);
    try {
        const query = req.params.search;
        console.log({query})
        try {
            const productPaginate = await Product.paginate({$or : [{name: { $regex: query.toUpperCase() }}, {brand: { $regex: query.toUpperCase()}}]}, {offset, limit});
            let products = productPaginate.docs
            console.log("llega")
            console.log(products.length)
            if (products.length < 1) {
                throw new Error("nope")
            }
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

    const productId = req.params.id;
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).send({ message: "Error processing form data." });
        }

        const productData = fields;

        // Handle imgSrc and imgSrc2
        try {
            productData.imgSrc = await processImageField(productData.imgSrc);
            productData.imgSrc2 = await processImageField(productData.imgSrc2);
        } catch (error) {
            return res.status(400).send({ message: "Error processing image data." });
        }

        try {
            const product = await Product.findOneAndUpdate(
                { productId: productId },
                productData,
                { useFindAndModify: false, new: true }
            );
            if (!product) {
                res.status(404).send({
                    message: `Cannot update Product with productId=${productId}. Maybe Product was not found!`,
                });
            } else res.send(product);
        } catch (e) {
            res.status(500).send({
                message: "Error updating Product with productId=" + productId,
            });
        }
    });
};

async function processImageField(imageField) {
    if (imageField && imageField.length > 200) {
        return imageField; // Assume it's already in Base64 format
    } else if (imageField && imageField.startsWith("http")) {
        return await imageToBase64(imageField);
    }
    return '';
}

// ELIMINA PRODUCTO POR ID
exports.delete = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
        });
    }

    const id = req.params.id;

    try {
        const productFind = await Product.findOne({productId: id});

        const product = await Product.findByIdAndRemove(productFind._id, {useFindAndModify: false});
        if (!product) {
            res.status(404).send({
                message: `Cannot delete Product with id=${id}. Maybe Product was not found!`,
            });
        } else res.status(200).send(product);
    } catch (e) {
        res.status(500).send({
            message: "Error deleting Product with id=" + id,
        });
    }
};

