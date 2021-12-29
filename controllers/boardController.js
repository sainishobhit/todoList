const { validator, jwt } = require('../utils')
const { userModel, boardModel } = require('../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const createBoard = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        };

        const {  members, name } = requestBody;

        if (!validator.isValid(name)) {
            res.status(400).send({ status: false, message: 'Please enter the name' })
            return
        };

        if (!validator.isValidString(name)) {
            res.status(400).send({ status: false, message: 'Name is a string' })
            return
        };

        if (!validator.isValid(members)) {
            res.status(400).send({ status: false, message: 'Enter number of members' })
            return
        };

        if (!validator.isValidNumber(members)) {
            res.status(400).send({ status: false, message: 'Please enter a valid number' })
            return
        };

        const boardData = { userId: req.user.UserId, members, name }

        const newBoard = await boardModel.create(boardData)
        res.status(201).send({ status: true, message: 'Success', data: newBoard })

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

const deleteBoard = async function (req, res) {
    try {
        const boardId = req.params.boardId

        if (!validator.isValidObjectId(boardId)) {
            res.status(400).send({ status: false, message: `${boardId} is invalid` })
            return
        };

        const board = await boardModel.findOne({ _id: boardId, isDeleted: false, deletedAt: null })

        if (!board) {
            res.status(404).send({ status: false, message: `Board not found` })
            return
        };

        await boardModel.findOneAndUpdate({ _id: boardId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: 'Board Deleted Successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

module.exports = {
    createBoard, deleteBoard
};