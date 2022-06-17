const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (mongoose) => {

    const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please provide name'],
            minlength: 4,
            maxlength: 25,
            trim: true
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: validator.isEmail,
                message: 'Please provide a valid email adress'
            },
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please provide password'],
            minlength: 6,
            select: false
        }
    })

    UserSchema.pre('save', async function () {
        const salt = await bcryptjs.genSalt(10)
        this.password = await bcryptjs.hash(this.password, salt)
    })

    UserSchema.methods.createJWT = function () {
        return jwt.sign({userId: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    }

    UserSchema.methods.comparePassword = async function (candidate) {
        const isMatch = await bcryptjs.compare(candidate, this.password)
        return isMatch
    }


    const User = mongoose.model("user", UserSchema);
    return User;
};
