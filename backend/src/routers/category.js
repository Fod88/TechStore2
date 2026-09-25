const express = require("express")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/admin")
const Category = require("../models/category")
const mongoose = require("mongoose")
const router = express.Router()

// CREATE A NEW CATEGORY

router.post('/categories' , auth , adminAuth , async (req , res) => {
    try{
        const fields = Object.keys(req.body)
        const isValid = fields.every(field => field === "name")
        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const {name} = req.body
        if(!name){
            return res.status(400).send({error : "name is required"})
        }
        
        const category = await Category.findOne({name})
        if(category){
            return res.status(400).send({error : "name of Category has already been used"})
        }

        const new_category = new Category({name})
        await new_category.save()

        res.status(201).send(new_category)

    }

    catch (error) {
        res.status(500).send({error : error.message})
    }
})


// GET ALL ACTIVE CATEGORIES
router.get('/categories'  , async (req , res) => {
    try{
        const categories = await Category.find({isActive : true})
        res.status(200).send(categories)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// UPDATE CATEGORY BY ID
router.patch('/categories/:id' , auth , adminAuth , async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid category id"})
        }

        const fields = Object.keys(req.body)
        const isValid = fields.every(field => field === "name")
        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        } 

        const {name} = req.body
        if (!name) {
            return res.status(400).send({
                error: "name is required"
            })
        }

        const preCategory = await Category.findById(_id)
        if(! preCategory){
            return res.status(404).send({error : "404 Category not found"})
        }

        const category = await Category.findOne({name})
        if(category && category._id.toString() !== _id){

            return res.status(400).send({error : "name of Category has already been used"})
        }

        preCategory.name = name
        await preCategory.save()

        res.status(200).send(preCategory)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// ARCHIVE CATEGORY BY ID

router.delete('/categories/:id' , auth , adminAuth , async (req , res) => {
    try{

        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid category id"})
        }

        const category = await Category.findById(_id)
        if(! category || ! category.isActive){
            return res.status(404).send({error : "404 Category not found"})
        }

        category.isActive = false
        await category.save()
        res.status(200).send(category)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


module.exports = router