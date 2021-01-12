import jwt from 'jsonwebtoken'

// Bad Request response function
const badRequest = (input, res) => {
    res.status(400).json(input)
}

//general request body validation 
const objProps = ["name", "email", "phoneNumber", "content"]
const message = {
    message: "validation error", 
    invalid: []
}
const validateItem = (req, res, next) => {
    message.invalid = []
    const objKeys = Object.keys(req.body)//count keys in req, compare to etalon object
    const errors = objProps.filter((properties) => !objKeys.includes(properties))
    if (objKeys.length < 4) {
        errors.forEach(element => message.invalid.push(element))
        return badRequest(message, res)
    }
    next()
}
//new user general validation, validation middleware could be combined with validateItem
const objUserProps = ["name", "password", "email"]
const validateUser = (req, res, next) => {
    message.invalid = []
    const objKeys = Object.keys(req.body)
    const errors = objUserProps.filter((properties) => !objKeys.includes(properties))
    if (objKeys.length < 3) {
        errors.forEach(element => message.invalid.push(element))
        return badRequest(message, res)
    }
    next()
}
// strings validation for name, only latin letters and spaces accepted
const validateString = (req, res, next) => {
    const letters = /^[A-Za-z ]+$/;
    if(!req.body.name.match(letters) || !req.body.name.value == 0){
        message.invalid.push("name")
    }
    next()

}
// password for user creation validation. Passwords between 8-16 characters accepted
const validatePswd = (req, res, next) => {
    const passw = /^[A-Za-z]\w{8,16}$/
    if (!req.body.password.match(passw)){
        message.invalid.push("password")
    }
    next()
}
// //email validation middleware, generic 
const validateEmail = (req, res, next) => {
    const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if(!req.body.email.match(mailformat)){
        message.invalid.push("email")
    }
    next()
}
//phone number validation: the only format accepted is 10 digits, no spaces, no characters
const validatePhone = (req, res, next) => {
    const phoneno = /^\d{10}$/;
    if(!req.body.phoneNumber.match(phoneno)){
        message.invalid.push("phoneNumber")
    }
    next()
}
//middleware for Bad Request object return based on lenght of object's array entries
const returnMessage =(req, res, next) => {
    if (message.invalid.length > 0){
        return badRequest(message, res)
    }
    next()
}
//token authorisation middleware
const authToken = (req, res, next) => {
    const reqHeader = req.headers['authorization']
    const token = reqHeader && reqHeader.split(' ')[1]
    const message = { message: "token not provided" }
    if (!token) return res.status(403).json(message)
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json(message)

    next()
    }
)}
    export { badRequest, objProps, message, validateItem, validateString, objUserProps,
        validateUser, validateEmail, validatePhone, validatePswd, returnMessage, authToken
    }