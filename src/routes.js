import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import util from 'util'
import fs from 'fs'
import path from 'path'
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const entrPath = path.resolve('data/entries.json')
const usrPath = path.resolve('data/users.json')
const router = express.Router()
const bodyParser = import('body-parser')//not used
import jwt from 'jsonwebtoken'
const bcrypt = import('bcryptjs')//not used yet
//const entries =[]// an array to store entries, for now
import { badRequest, objProps, objUserProps, message, validateItem, validateUser, validateString,
    validateEmail, validatePhone, validatePswd, returnMessage 
} from './helpFns.js'

async function readItems() {
    const json = await readFile(entrPath);
    return JSON.parse(json);
  }
  
  
// //file reading function for get
// async function readAll(pathTo) {
//     const json = await readFile(pathTo,function (err, data) {
//         if (err) {return res.status(404).json("Resourse not found")}
//         return data
//     })
//     return JSON.parse(json)
// }

// // file reading function for post
// async function readPost(pathTo) {
//     const json = await readFile(pathTo,function (err, data) {
//         if (err) {return []}
//         return data
//     })
//     return JSON.parse(json)
// }

//users file writing function
async function writeAll(item, pathTo) {
    const json = JSON.stringify(item, null, 2)
    return writeFile(pathTo, json)
}

//users file reading function
// async function readAllEntries() {
//     const json = await readFile(entrPath);
//     return JSON.parse(json);
// }
//users file writing function
// async function writeEntries(item) {
//     const json = JSON.stringify(item, null, 2);
//     return writeFile(entrPath, json)
// }

//Route to create an entry when the user submits their contact form:
router.post('/contact_form/entries', validateItem, validateString, validateEmail, validatePhone, returnMessage, async (req, res) => {
    //unique id generator
    req.body.id = uuidv4()
    const entries = await readItems(entrPath)
    const requestOrganizer = ({ id, name, email, phoneNumber, content }) => ({ id, name, email, phoneNumber, content })//used destructuring for keeping order of object
    entries.push(requestOrganizer(req.body))
    writeAll(entries, entrPath)
    return res.status(201).json(requestOrganizer(req.body))
})

//Route to create a user, saving users in array for now
const users = []
//const objUserProps = ["name", "password", "email"]
router.post('/users', validateUser, validateString, validatePswd, validateEmail, returnMessage, (req, res) => {
    req.body.id = uuidv4()
    const requestFilter = ({ id, name, email }) => ({ id, name, email })
    users.push(requestFilter(req.body))
    writeUsers(users)
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

router.get('/contact_form/entries', authToken, async (req, res) => {
    const entries = await readItems(entrPath)
    res.status(200).send(entries)
    }
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