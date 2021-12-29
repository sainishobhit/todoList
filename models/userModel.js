const mongoose = require('mongoose')
const { validator } = require('../utils')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name is required',
        trim: true
    },
    email: {
        type: String,
        required: 'Email is required',
        trim: true,
        lowercase: true,
        unique: true,
        validate: { validator: validator.validateEmail, message: 'Please fill a valid email address' },
        match: [validator.emailRegex, 'Please fill a valid email address']
    },
    profileImage: {
        type: String,
        required: 'Profile Image is required',
    },
    phone: {
        type: String,
        required: 'Phone Number is required',
        unique: true,
        trim: true,
        validate: { validator: validator.validatePhone, message: 'Please fill a valid phone number' },
        match: [validator.phoneRegex, 'Please fill a valid phone number']
    },
    password: {
        type: String,
        required: 'Password is required',
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)