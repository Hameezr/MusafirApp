const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.signup = async (req, res, next) => {
    try { 
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        })

        const token = jwt.sign({id: newUser._id}, 'secret')

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: err
        })
    }
} 