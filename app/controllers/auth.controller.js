const db = require("../models");
const User = db.User;


exports.login = async (req, res) => {
    const {email,password} = req.body

    if(!email || !password) {
        res.status(500).json({msg:"please provide all values"})
    }
    const user = await User.findOne({email}).select('+password')

    if(!user){
        res.status(500).json({msg:'Invalid credentials'})
    }

    const isCorrect = await user.comparePassword(password)

    if(!isCorrect) {
        res.status(500).json({msg:'Invalid credentials'})
    }

    const token = user.createJWT()
    user.password = undefined
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_LIFETIME) * 1000,
    });
    res.status(201).json({ user });
};

exports.register = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const user = await User.create({name, email, password});
        const token = user.createJWT();
        res.status(201).json({user: {email: user.email, name: user.name}, token});
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({msg: 'An error occurred', error: error.message || 'Unknown error'});
    }
};



