const validator = require("validator");
module.exports = (mongoose) => {

    const productCategorySchema = new mongoose.Schema({
        name: String,
        totalProducts: Number
    }, {
        versionKey: false,
    });
    const ProductCategory = mongoose.model("productCategory", productCategorySchema);
    return ProductCategory;
};
