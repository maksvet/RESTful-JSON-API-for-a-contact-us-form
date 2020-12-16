import express from 'express'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()
const bodyParser = require('body-parser')//not used yet
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')//not used yet
const entries =[]// an array to store entries, for now
import { badRequest, objProps, objUserProps, message, validateItem, validateUser, validateString,
    validateEmail, validatePhone, validatePswd, returnMessage 
} from './helpFns.js'

//Route to create an entry when the user submits their contact form:
router.post('/contact_form/entries', validateItem, validateString, validateEmail, validatePhone, returnMessage, (req, res) => {
    //unique id generator
    req.body.id = uuidv4()
    const requestOrganizer = ({ id, name, email, phoneNumber, content }) => ({ id, name, email, phoneNumber, content })//used destructuring for keeping order of object
    entries.push(requestOrganizer(req.body))
    return res.status(201).json(requestOrganizer(req.body))
})

//Route to create a user, saving users in array for now
const users = []
//const objUserProps = ["name", "password", "email"]
router.post('/users', validateUser, validateString, validatePswd, validateEmail, returnMessage, (req, res) => {
    req.body.id = uuidv4()
    const requestFilter = ({ id, name, email }) => ({ id, name, email })
    users.push(requestFilter(req.body))
    return res.status(201).json(requestFilter(req.body))
})

//Route to log a registered user in to create a JWT (JSON Web Token) token:

router.post('/auth', (req, res) => {
    const storedPswd = "somepassword"
    const storedEmail = "address@email.com"
    if (req.body.email !== storedEmail || req.body.password !== storedPswd){
        return res.status(403).json("incorrect credentials provided")
        }
    const user = ({
    email : req.body.email,
    password : req.body.password
    })
    const token = jwt.sign( user, process.env.TOKEN_SECRET, {
        expiresIn: 1800
        }
    )
    return res.status(200).send({ token: token })
})

//Route to get a listing of all submissions when given a valid JWT is provided

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

router.get('/contact_form/entries', authToken, (req, res) => 
    res.status(200).send(entries)
)

//Route to get a specific submission when given an ID alongside a valid JWT:

router.get('/contact_form/entries/:id', authToken, (req, res) => {
    if (!entries){
        return {message: `no entries found`}
    }
    const idFound = entries.find(searchObj => searchObj.id == req.params.id)
    if (!idFound){
        return res.status(400).json({message: `entry ${req.params.id} not found`})
    }
    return res.status(200).send(idFound)
    }
)
export default router