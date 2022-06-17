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
    res.status(201).json({user,token})

};

exports.register = async (req, res) => {
    try {

        const {name,email,password} = req.body
        const user = await User.create({name,email,password})
        const token = user.createJWT()
        res.status(201).json({user:{email:user.email,name:user.name},token})


    }catch(error) {
        res.status(500).json({msg:'an error occurred'})
    }


};



