const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Oh Please do tell your name'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is always mandatory'],
        minlength: 8,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on create and save!! like how we used User.create in authcontroller 
            validator: function(el) {
                return el === this.password // will return true if password abc = abc confirmpassword, hence validation passed
            }, 
            message: 'Password not matching',
        }
    }
})

userSchema.pre('save', async function(next){
    // if the password is not modified simply return from this function and call the next middleware
    if(!this.isModified('password')) return next(); //isModified is a built in function used to check if smth is modified
    
    // hash the password with cost of 12
    this.password = await bcryptjs.hash(this.password, 12);
    this.passwordConfirm = undefined; // to delete a field simply assign undefined
})

const User = mongoose.model('User', userSchema);

module.exports = User;