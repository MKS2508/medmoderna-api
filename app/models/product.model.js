const validator = require("validator");
module.exports = (mongoose, mongoosePaginate) => {
  let schema = mongoose.Schema(
      {
          name: {
              type: String,
              required: [true, 'Please provide name'],
              minlength: 4,
              maxlength: 50,
              trim: true
          },
          productId: {
              type: String,
              required: false,
              validate: {
                  validator: validator.isAlphanumeric,
                  message: 'Please provide a valid product id'
              },
              unique: true
          },
          price: {
              type: Number,
              required: [true, 'Please provide price'],
          },
          description: {
              type: String,
              required: true,
          },
          brand: {
              type: String,
              required: true,
          },
          category: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "productCategory"
          },
          imgSrc: {
              type: String,
          },

      },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Product = mongoose.model("product", schema);
  return Product;
};
