import express from 'express'
import * as help from './helpFns.js'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()
const entries =[]
const message = {
    message: "validation error",
    invalid: []
}
const items = "hello"

//{error: `missing id or task from request`}fieldName


const objProps = ["name", "email", "phoneNumber", "content"]
const objKeys = (req) => Object.keys(req.body)
const errors = (request) => objProps.filter((properties) => !objKeys(request).includes(properties))
const validateItem = (req, res, next) => {
    if (objKeys(req).length < 4) {
        errors(req).forEach(element => message.invalid.push(element))
        return res.status(400).json(message)
    } 
    next()
}
//email validation middleware
const ValidateEmail = (req, res, next) =>{
    const email = req.body.email
    const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if(!email.match(mailformat)){
        return res.status(400).json("You have entered an invalid email address!")
    }
    next()
}
//Route to create an entry when the user submits their contact form:
router.post('/contact_form/entries', validateItem, ValidateEmail, (req, res) => {
        req.body.id = uuidv4()
        entries.push(req.body);
        return res.status(201).json(req.body.email);
})

//Route to create a user:
router.post('/users', /*validateItem,*/ (req, res) => {
    

    //items.push(req.body)
    return res.status(201).send(req.body)
})

//Route to log a registered user in to create a JWT (JSON Web Token) token:
router.post('/auth', validateItem, (req, res) => {
    

    items.push(req.body)
    return res.status(201).send(req.body)
})

//Route to get a listing of all submissions when given a valid JWT is provided
//as part of the :
//Authorization: bearer token
router.get('/contact_form/entries', (req, res) => {
    return res.send(items)
})

//Route to get a specific submission when given an ID alongside a valid JWT:
//Authorization: bearer token
router.get('/contact_form/entries/:id', (req, res) => {
    return res.send("items")
})

export default router