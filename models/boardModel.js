const mongoose = require('mongoose')
//const { systemConfig } = require('../configs')

const boardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: 'userId is required',
        refs: "User",
    },
    name:{
        type: String,
        required:"Please enter the name"
    },
    members: {
        type: Number,
        required: "Enter number of members"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model('Board', boardSchema)