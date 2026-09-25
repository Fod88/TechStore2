
const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/admin")


const router = express.Router()



// REGUSTER

router.post("/users/register" , async (req , res) => {
    try{
        const allowedFields = ["name", "email", "password"]

        const fields = Object.keys(req.body)

        const isValid = fields.every(field => allowedFields.includes(field))

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid fields"
            })
        }

        const {name , email , password} = req.body
        if(!name || !email || !password){
            return res.status(400).send({"error": "Name, email and password are required"})
        }

        const user = await User.findOne({email})

        if(user){
            return res.status(400).send({"error" : "email has already been used; please use a different email."})
        }

        const hashedPassowrd = await bcrypt.hash(password , 10)

        const new_user = new User(
            {
                name,
                email,
                password : hashedPassowrd
            }
        )

        await new_user.save()

        const userResponse = {
            id: new_user._id,
            name: new_user.name,
            email: new_user.email,
            role: new_user.role
        }

        res.status(201).send(userResponse)

    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// LOGIN

router.post('/users/login' , async (req , res) => {
    try{
        const allowedFields = ["email", "password"]

        const fields = Object.keys(req.body)

        const isValid = fields.every(field => allowedFields.includes(field))

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid fields"
            })
        }

        const {email , password} = req.body
        if(!email || !password){
            return res.status(400).send({"error": "email and password are required"})
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(401).send({"error" : "Unable to Login"})
        }
        
        const isValidPassword = await bcrypt.compare(password , user.password)

        if(! isValidPassword){
            return res.status(401).send({"error" : "Unable to Login"})
        }

        const token = jwt.sign({_id : user._id.toString() , role : user.role} , process.env.JWT_SECRET)

        res.status(200).send({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        })
    }

    catch (error) {
        res.status(500).send({error : error.message})
    }
})



// ADMIN GET ALL USERS

router.get('/admin/users' , auth , adminAuth , async (req , res) => {
    try{
        const users = await User.find({}).select("-password")
        res.status(200).send(users)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


module.exports = router