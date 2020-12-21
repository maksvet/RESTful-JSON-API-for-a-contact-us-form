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
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { badRequest, objProps, objUserProps, message, validateItem, validateUser, validateString,
    validateEmail, validatePhone, validatePswd, returnMessage, authToken
} from './helpFns.js'

// Files reading function
async function readItems(path) {
    let json = await readFile(path)
    return JSON.parse(json)
}


//files writing function
async function writeAll(item, pathTo) {
    const json = JSON.stringify(item, null, 2)
    return writeFile(pathTo, json)
}

//Route to create an entry when the user submits their contact form:
router.post('/contact_form/entries', validateItem, validateString, validateEmail, validatePhone, returnMessage, async (req, res) => {
    req.body.id = uuidv4()
    fs.access(entrPath, fs.F_OK, (err) => {// couldn't think of better way to check if file is present
        if (err) {
            const entries = []
            const requestOrganizer = ({ id, name, email, phoneNumber, content }) => ({ id, name, email, phoneNumber, content })// I kept this only to keep formatig of request body as in instuctions
            entries.push(requestOrganizer(req.body))
            writeAll(entries, entrPath)
            return res.status(201).json(requestOrganizer(req.body))
        }   
    })
    const entries = await readItems(entrPath)
    const requestOrganizer = ({ id, name, email, phoneNumber, content }) => ({ id, name, email, phoneNumber, content })//used destructuring for keeping order of object
    entries.push(requestOrganizer(req.body))
    writeAll(entries, entrPath)
    return res.status(201).json(requestOrganizer(req.body))
})

//Route to create a user, saving users in array for now

router.post('/users', validateUser, validateString, validatePswd, validateEmail, returnMessage, async (req, res) => {
    req.body.id = uuidv4()
    fs.access(usrPath, fs.F_OK, (err) => {
        if (err) {
            const users = []
            req.body.password = bcrypt.hashSync(req.body.password, 10)
            users.push(req.body)
            const requestFilter = ({ id, name, email }) => ({ id, name, email })

            writeAll(users, usrPath)
            return res.status(201).json(requestFilter(req.body))
        }   
    })
    const users = await readItems(usrPath)
    req.body.password = bcrypt.hashSync(req.body.password, 10)
    console.log(req.body.password)
    users.push(req.body)
    const requestFilter = ({ id, name, email }) => ({ id, name, email })// I kept this only to keep formatig of request body as in instuctions
    writeAll(users, usrPath)
    return res.status(201).json(requestFilter(req.body))
})

//Route to log a registered user in to create a JWT (JSON Web Token) token:

router.post('/auth', async (req, res, error) => {
    const users = await readItems(usrPath).reject(new error)
    const emailFound = users.find(searchObj => searchObj.email == req.body.email)// I used email to find users because request body doesnt have ID originally
        if (!emailFound){
            return res.status(403).json("incorrect email provided")
        }
    const pswdValid = bcrypt.compareSync(req.body.password, emailFound.password)//Used sync
    if (!pswdValid){
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


router.get('/contact_form/entries', authToken, async (req, res) => {
    const entries = await readItems(entrPath)
    res.status(200).send(entries)
    }
)

//Route to get a specific submission when given an ID alongside a valid JWT:

router.get('/contact_form/entries/:id', authToken, async (req, res) => {
    const entries = await readItems(entrPath)
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