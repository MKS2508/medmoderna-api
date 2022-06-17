const db = require("../models");
const ProductCategory = db.productCategory;
const CATEGORIES = ["CBD", "CULTIVO", "ILUMINACION", "PARAFERNALIA", "ROPA"];

const createProductCategories = async() => {
    try {
        console.log("CREATING")
        // Count Documents
        const count = await ProductCategory.estimatedDocumentCount();

        // check for existing roles
        if (count > 0) {
            console.log("already exists")
            return
        };

        // Create default Roles
        const values = await Promise.all([
            CATEGORIES.map((item) => {
                new ProductCategory({ name: item }).save();
            })
        ]);

    } catch (error) {
        console.error(error);
    }
};
/*
export const reset = async() => {
    try {
        // Count Documents

        const count = await IoTSession.estimatedDocumentCount();
        // check for existing roles
        if (count > 0){
            const edit = await IoTSession.find({})

            const updatedProduct = await IoTSession.findByIdAndUpdate(
                edit[0]._id,
                {isConnected: false}, {
                    new: true,
                }
            );
            log(logInfo + ' ' + logBold( "Connected: "+updatedProduct.isConnected));

        }  else{
            const values = await Promise.all([
                new IoTSession({ isConnected: false}).save(),
            ]);
            log(logInfo + ' ' + logBold(values));

        }

        // Create default Roles


    } catch (error) {
        console.error(error);
    }
};

export const createModes = async() => {
    try {
        // Count Documents
        const count = await IotMode.estimatedDocumentCount();

        // check for existing roles
        if (count > 0) return;

        // Create default Roles
        const values = await Promise.all([
            new IotMode({ name: "relay" , pins: [1]}).save(),
            new IotMode({ name: "rgb", pins:[12,14,15] }).save(),
            new IotMode({ name: "sensor", pins:[1] }).save(),
            new IotMode({ name: "piezo", pins:[1] }).save(),
            new IotMode({ name: "lamp", pins:[2] }).save(),

        ]);

        log(logInfo + ' ' + logBold(values));
    } catch (error) {
        console.error(error);
    }
};

export const createAdmin = async() => {
    // check for an existing admin user
    const user = await User.findOne({ email: "admin@localhost" });
    // get roles _id
    const roles = await Role.find({ name: { $in: ["admin", "moderator"] } });

    if (!user) {
        // create a new admin user
        const userDefault = await User.create({
            username: "admin",
            email: "admin@localhost",
            password: await bcrypt.hash("admin", 10),
            roles: roles.map((role) => role._id),
        });

        log(logInfo + logBold('Usuario Administrador y roles creados ! ') + '\n' + logInfo + '\n' + logBoldBG2(userDefault));
    }
};
*/
module.exports = {
    createProductCategories
}