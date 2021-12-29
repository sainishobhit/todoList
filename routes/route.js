const express = require('express');
const fs = require("fs");

const router = express.Router();

const { userAuth } = require('../middleware')
const { userController, boardController, todoController } = require('../controllers')

//userRoutes
router.post('/register', userController.registerUser);
router.post('/login/password', userController.loginPassword);
router.put('/user/update/:userId', userAuth, userController.updateUser);
router.post('/login/phone', userController.loginPhone);
router.post('/login/phone/otp', userController.verifyOtp);
//router.post('/login/email', userController.loginEmail);

//boardRoutes
router.post('/createBoard',userAuth, boardController.createBoard);
router.delete('/deleteBoard/:boardId', userAuth, boardController.deleteBoard);

//todoRoutes
router.post('/create/:boardId', userAuth, todoController.createTask);
router.get('/get/:boardId', userAuth, todoController.getTask);
router.put('/task/update/:taskId', userAuth, todoController.updateTask);
router.delete('/delete/:taskId', userAuth, todoController.deleteTask);


module.exports = router;