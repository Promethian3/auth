const router = require("express").Router();
const User = require("../model/User");

// * validation
const { registerValidation, loginValidation } = require("../validation");

// * Encryption
const bcrypt = require("bcrypt");


// ! REGISTER
router.post("/register", async (req, res) => {
    // * validate the user
    const { error } = registerValidation(req.body);
    if ( error ) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    // * Does User Exist? --> No Duplicates!
    const isEmailExist = await User.findOne({ email: req.body.email });
    if ( isEmailExist ) {
        return res.status(400).json({ error: "Email already exists" });
    }

    // * hash the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password, // hashed password :)
    });
    try {
        const savedUser = await user.save();
        res.status(200).json({ error: null, data: { userId: savedUser._id } });
    } catch (error) {
        res.status(400).json({ error });
    }
});


// ! LOGIN
router.post("/login", async (req, res) => {
    // * validate the user
    const { error } = loginValidation(req.body);

    // * throw validation errors
    if ( error ) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOneAndUpdate({ email: req.body.email });
    
    // * throw error when email is wrong
    if ( !user ) return res.status(400).json({ error: "Email is wrong" });

    // * check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) return res.status(400).json({ error: "Password is wrong" });

    res.json({
        error: null,
        data: {
            message: "Login Successful"
        },
    });
});

module.exports = router;