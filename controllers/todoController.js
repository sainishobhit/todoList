const mongoose = require('mongoose')
const { validator, jwt } = require('../utils')
const { systemConfig } = require('../configs')
const cron = require('node-cron');
const { userModel, todoModel, boardModel } = require('../models')
const ObjectId = mongoose.Types.ObjectId

const createTask = async function (req, res) {
    try {
        const requestBody = req.body;
        const boardId = req.params.boardId;

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        };

        const { task, status } = requestBody;

        if (!validator.isValid(boardId)) {
            res.status(400).send({ status: false, message: 'boardId is required' })
            return
        };

        if (!validator.isValidObjectId(boardId)) {
            res.status(400).send({ status: false, message: `${boardId} is invalid` })
            return
        };

        const board = await boardModel.findOne({ _id: boardId, isDeleted: false, deletedAt: null })

        if (!board) {
            res.status(404).send({ status: false, message: `Board not found` })
            return
        };

        if (!validator.isValid(task)) {
            res.status(400).send({ status: false, message: 'task is required' })
            return
        };

        if (!validator.isValidString(task)) {
            res.status(400).send({ status: false, message: 'Enter a valid task' })
            return
        };

        if (!validator.isValid(status)) {
            res.status(400).send({ status: false, message: 'status is required' })
            return
        };

        if (!validator.isValidStatus(status)) {
            res.status(400).send({ status: false, message: `status should be among ${systemConfig.statusEnumArray.join(', ')}` })
            return
        };

        const registerTask = { task, status, boardId }
        const newTask = await todoModel.create(registerTask)
        res.status(201).send({ status: true, message: 'Task added successfully', data: newTask })

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

const getTask = async function (req, res) {

    try {
        const filterQuery = { isDeleted: false }
        const queryParams = req.query;
        const boardId = req.params.boardId;

        if (validator.isValidRequestBody(queryParams)) {
            const { status } = queryParams

            if (validator.isValid(status)) {
                filterQuery['status'] = status
            }
        }

        if (!validator.isValid(boardId)) {
            res.status(400).send({ status: false, message: 'boardId is required' })
            return
        };

        if (!validator.isValidObjectId(boardId)) {
            res.status(400).send({ status: false, message: `${boardId} is not a valid board id` })
        };

        let board = await boardModel.findOne({ _id: boardId, isDeleted: false, deletedAt: null })

        if (!board) {
            res.status(404).send({ status: false, message: 'Board not found' })
            return
        };

        const tasks = await todoModel.find(filterQuery, { task: 1, status: 1 });
        res.status(200).send({ status: true, message: 'Tasks list', data: tasks })

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

const cronJobForTaskUpdate = () => {

    cron.schedule('02 16 * * *', async () => {
        try {
            //let current = new Date();
            // let gte = new Date(current.getDate() - 1).toDateString() + ' 08:30:00';
            // {createdAt:{$lte: '2021-12-29T08:30:00.000+00:00'}}
            // const dateToday = new Date().toDateString() + ' 08:30:00';
            // console.log(dateToday);
            // const taskUpdate = await todoModel.findOne({ status: 'doing' })
            const taskUpdate = await todoModel.updateMany({ createdAt: { $lte: new Date() }, status: 'doing' }, { $set: { status: 'done' } });
            console.log(taskUpdate);
            //res.status(200).send({ status: true, message: 'Tasks list', data: taskUpdate })


        } catch (error) {
            console.log(error)
            res.status(500).send({ Status: false, Msg: error.message })
        }

    });
}

const updateTask = async function (req, res) {
    try {
        const taskId = req.params.taskId;
        const requestBody = req.body;

        if (!validator.isValid(taskId)) {
            res.status(400).send({ status: false, message: 'taskId is required' })
            return
        };

        if (!validator.isValidObjectId(taskId)) {
            res.status(400).send({ status: false, message: `${taskId} is not a valid task id` })
            return
        };

        let tasks = await todoModel.findOne({ _id: taskId, isDeleted: false, deletedAt: null })

        if (!tasks) {
            res.status(404).send({ status: false, message: 'task not found' })
            return
        };

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(200).send({ status: true, message: 'No paramateres passed. Task unmodified' })
            return
        };

        const { task, status } = requestBody;

        if (status && !validator.isValidStatus(status)) {
            res.status(400).send({ status: false, message: `status should be among ${systemConfig.statusEnumArray.join(', ')}` })
            return
        };

        const updatedTaskData = {}

        if (validator.isValid(task)) {
            if (!Object.prototype.hasOwnProperty.call(updatedTaskData, '$set')) updatedTaskData['$set'] = {}
            updatedTaskData['$set']['task'] = task
        };

        if (validator.isValid(status)) {
            if (!Object.prototype.hasOwnProperty.call(updatedTaskData, '$set')) updatedTaskData['$set'] = {}
            updatedTaskData['$set']['status'] = status
        };


        const updatedTask = await todoModel.findOneAndUpdate({ _id: taskId }, updatedTaskData, { new: true })
        res.status(200).send({ status: true, message: 'Task updated successfully', data: updatedTask });

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

// const cronJob = async function(req, res){
//     try{
//          // ...

//         // Schedule tasks to be run on the server.
//         const scheduler = cron.schedule('50 1 * * *', function () {
//             const taskUpdate = await todoModel.updateMany({ status: doing }, { status: done })
//         });
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({ Status: false, Msg: error.message })
//     }
// }

const deleteTask = async function (req, res) {
    try {
        const taskId = req.params.taskId

        if (!validator.isValid(taskId)) {
            res.status(400).send({ status: false, message: 'taskId is required' })
            return
        };

        if (!validator.isValidObjectId(taskId)) {
            res.status(400).send({ status: false, message: `${taskId} is not a valid task id` })
        };
        const task = await todoModel.findOne({ _id: taskId, isDeleted: false, deletedAt: null })

        if (!task) {
            res.status(404).send({ status: false, message: `task not found` })
        };

        if (task.isDeleted && deletedAt !== null) {
            res.status(404).send({ status: false, message: `Task is already deleted.` })
        };

        await todoModel.findOneAndUpdate({ _id: taskId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: `Task deleted successfully` })

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
};

module.exports = {
    createTask, getTask, updateTask, deleteTask, cronJobForTaskUpdate
};

