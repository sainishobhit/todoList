const mongoose = require('mongoose')
const { systemConfig } = require('../configs');

const reemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const remobile = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

const validateEmail = function (email) {
    return reemail.test(email)
};

const validatePhone = function (mobile) {
    return remobile.test(mobile)
};

const isValidArray = function (array) {
    return Object.keys(array).length > 0
};

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
};

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
};

const isValidString = function (value) {
    return Object.prototype.toString.call(value) === "[object String]"
};

const isValidNumber = function (value) {
    return Object.prototype.toString.call(value) === "[object Number]"
};

const isValidBoolean = function (value) {
    return Object.prototype.toString.call(value) === "[object Boolean]"
};

const isValidStatus = function (status) {
    return systemConfig.statusEnumArray.indexOf(status) !== -1
}

module.exports = {
    validateEmail,
    emailRegex: reemail,
    phoneRegex: remobile,
    isValid, isValidArray,
    isValidRequestBody,
    isValidObjectId,
    isValidString,
    isValidNumber,
    isValidBoolean,
    isValidStatus,
    validatePhone,
};