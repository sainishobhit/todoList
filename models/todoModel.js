const mongoose = require('mongoose')
const { systemConfig } = require('../configs')

const todoSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Types.ObjectId,
        required: 'boardId is required',
        refs: "Board",
    },
    task: {
        type: String,
        required: "Please Enter the task"
    },
    status:{
        type: String,
        required: 'status is required',
        enum: systemConfig.statusEnumArray
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

module.exports = mongoose.model('Todo', todoSchema)