const { validator, jwt } = require('../utils')
const { systemConfig } = require('../configs')
const { userModel, otpModel } = require('../models')
const bcrypt = require('bcrypt');
const fs = require('fs');
const client = require('twilio')(ACCOUNT_SID,AUTH_TOKEN);

const registerUser = async function (req, res) {
    try {
        const requestBody = req.body;
        const files = req.files

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        }

        const { name, email, phone, password } = requestBody;

        if (!validator.isValid(name)) {
            res.status(400).send({ status: false, message: 'Name is required' })
            return
        };

        if (!validator.isValidString(name)) {
            res.status(400).send({ status: false, message: 'Name Should be a string' })
            return
        };


        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        };

        if (!validator.validateEmail(email)) {
            res.status(400).send({ status: false, message: 'email is invalid' })
            return
        };

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        };

        const isEmailAlreadyUsed = await userModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} is already registered` })
            return
        };

        if (!validator.isValid(phone)) {
            res.status(400).send({ status: false, message: 'Phone number is required' })
            return
        };

        if (!validator.validatePhone(phone)) {
            res.status(400).send({ status: false, message: 'Phone number is invalid' })
            return
        };

        const isPhoneAlreadyUsed = await userModel.findOne({ phone });

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} is already registered` })
            return
        };

        if (!validator.isValid(files[0])) {
            res.status(400).send({ status: false, message: 'Profile Image is required' })
            return
        };

        var profileImage = files[0].originalname
        let image = `assets/${profileImage}`
        let fileData = files[0].buffer
        fs.writeFile(image, fileData, function (error, data) {
            if (error) {
                console.log({ msg: error.message })
            }
        }
        )

        const salt = await bcrypt.genSalt(systemConfig.salt)
        const hashed = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            phone,
            password: hashed,
            profileImage
        };

        const newUser = await userModel.create(userData)
        res.status(201).send({ status: true, message: 'User created successfully', data: newUser })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const loginPassword = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        };

        const { email, password } = requestBody;

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        };

        if (!validator.validateEmail(email)) {
            res.status(400).send({ status: false, message: 'email is invalid' })
            return
        };

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        };

        const user = await userModel.findOne({ email });

        if (!user) {
            res.status(401).send({ status: false, message: `Invalid Login Credentials` })
            return
        };

        const validPassword = await bcrypt.compare(requestBody.password, user.password);

        if (!validPassword) {
            res.status(401).json({ Status: false, message: "Invalid password" });
        }

        const token = await jwt.createToken(user._id);
        res.header('x-api-key', token);
        res.status(200).send({ status: true, message: 'user Login Successfull', data: { token } });

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
}

const loginPhone = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        };
        const { phone } = requestBody;

        if (!validator.isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone number is required' })
            return
        };

        if (!validator.validatePhone(phone)) {
            res.status(400).send({ status: false, message: 'phone number is invalid' })
            return
        };

        const user = await userModel.findOne({ phone });

        if (!user) {
            res.status(401).send({ status: false, message: `Phone number not registered` })
            return
        };

        const OTP = Math.floor(100000 + Math.random() * 90000)
        const ttl = 2 * 60 * 1000
        // const expires = Date.now() + ttl;

        const otpResponse = await client.messages.create({
            body: `your one time login password is ${OTP}`,
            from: +17069289042,
            to: `+91${phone}`
        })

        console.log(otpResponse);

        const otp = await otpModel.create({ otp: OTP });
        return res.status(200).send("Otp send successfully!");

    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
}

const verifyOtp = async function (req, res) {
    try {

        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide details' })
            return
        };

        const { phone, otp } = requestBody;

        if (!validator.isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone is required' })
            return
        };

        if (!validator.validatePhone(phone)) {
            res.status(400).send({ status: false, message: 'phone is invalid' })
            return
        };

        if (!validator.isValid(otp)) {
            res.status(400).send({ status: false, message: 'otp is required' })
            return
        };

        const user = await userModel.findOne({ phone });

        if (!user) {
            res.status(401).send({ status: false, message: `Phone number not registered` })
            return
        };

        const otpHolder = await otpModel.find({ otp: req.body.otp });

        if (otpHolder.length === 0) return res.status(400).send("you used an expired OTP!");

        const rightOtpFind = otpHolder[otpHolder.length - 1];

        if (rightOtpFind.otp === req.body.otp) {

            const token = await jwt.createToken(user._id.toHexString());
            res.header('x-api-key', token);
            res.status(200).send({ status: true, message: 'user Login Successfull', data: { token } });
        }
        else {
            return res.status(400).send("You otp was wrong!")
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })
    }
}



const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;


        if (!validator.isValid(userId)) {
            res.status(400).send({ status: false, message: 'userId is required' })
            return
        };

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        };

        let user = await userModel.findOne({ _id: userId })

        if (!user) {
            res.status(404).send({ status: false, message: 'user not found' })
            return
        };

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(200).send({ status: true, message: 'No paramateres passed. Task unmodified' })
            return
        };

        const { name, password } = requestBody;

        const updatedUserData = {}

        if (validator.isValid(user)) {
            if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}
            updatedUserData['$set']['name'] = name
        };

        if (validator.isValid(password)) {
            if (!Object.prototype.hasOwnProperty.call(updatedUserData, '$set')) updatedUserData['$set'] = {}
            const salt = await bcrypt.genSalt(systemConfig.salt)
            const hashed = await bcrypt.hash(password, salt);
            updatedUserData['$set']['password'] = hashed
        };


        const updatedData = await userModel.findOneAndUpdate({ _id: userId }, updatedUserData, { new: true })
        res.status(200).send({ status: true, message: 'Details updated successfully', data: updatedData });


    } catch (error) {
        console.log(error)
        res.status(500).send({ Status: false, Msg: error.message })

    }
}

module.exports = { registerUser, loginPassword, updateUser, loginPhone, verifyOtp };

