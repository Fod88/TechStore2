const express = require("express")
const mongoose = require("mongoose")
const Product = require("../models/product")
const Category = require("../models/category")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/admin")

const router = express.Router()


const upload = require("../middleware/uploadMiddleware"); // مسار ملف إعدادات cloudinary و multer

// CREATE A NEW PRODUCT
router.post('/products', auth, adminAuth, upload.single('image'), async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        const allowedFields = ["name", "description", "price", "stock", "categoryId"]

        const fields = Object.keys(req.body);

        const isValid = fields.every(field => allowedFields.includes(field));

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid fields"
            });
        }

        const { name, description, price, stock, categoryId } = req.body;

        // 1. تحويل price و stock إلى أرقام لأن FormData يرسل البيانات كـ Strings
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);

        if (!name || !description || price === undefined || stock === undefined || !categoryId) {
            return res.status(400).send({ "error": "name, description, price, stock and categoryId are required" });
        }

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).send({ error: "Price must be a non-negative number" });
        }

        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).send({ error: "Stock must be a non-negative number" });
        }

        if (!mongoose.isValidObjectId(categoryId)) {
            return res.status(400).send({ error: "Invalid category Id" });
        }

        const category = await Category.findById(categoryId);
        if (!category || !category.isActive) {
            return res.status(404).send({ error: "404 not found" });
        }

        const product = await Product.findOne({ name });
        if (product) {
            return res.status(400).send({ error: "Product has already been existed" });
        }

        // 2. الحصول على رابط الصورة المرفوعة على Cloudinary أو استخدام الرابط المرسل في req.body إن وجد
        const imageUrl = req.file ? req.file.path : req.body.image;

        const new_product = new Product({
            name,
            description,
            price: parsedPrice,
            stock: parsedStock,
            image: imageUrl, // حفظ رابط Cloudinary هنا
            categoryId
        });

        await new_product.save();
        res.status(201).send(new_product);
    } 
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// GET ALL ACTIVE PRODUCTS
router.get('/products' , async (req , res) => {
    try{
        const allowedFields = ["search", "category", "minPrice" , "maxPrice" , "sort"]

        const fields = Object.keys(req.query)

        const isValid = fields.every(field => allowedFields.includes(field))

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid fields"
            })
        }


        const {search , category , minPrice , maxPrice , sort} = req.query
        const query = {isActive : true}

        // search by name 
        if(search){
            query.name = {$regex : search , $options : "i"}
        }

        // search by category
        if(category){
            if(! mongoose.isValidObjectId(category)){
                return res.status(400).send({error : "Invalid category id "})
            } 

            query.categoryId = new mongoose.Types.ObjectId(category)
        }

        // search for product by average price

        if(minPrice !== undefined || maxPrice !== undefined){
            query.price = {}

            if(minPrice !== undefined){
                const min = Number(minPrice)
                if (Number.isNaN(min)) {
                    return res.status(400).send({
                        error: "minPrice must be a number"
                    })
                }
                if(min < 0){
                    return res.status(400).send({error : "Price must be a non-negative number"})
                }
                query.price.$gte = min
            }

            if(maxPrice !== undefined){
                const max = Number(maxPrice)

                if (Number.isNaN(max)) {
                    return res.status(400).send({
                        error: "maxPrice must be a number"
                    })
                }

                if(max < 0){
                    return res.status(400).send({error : "Price must be a non-negative number"})
                }

                query.price.$lte = max
            }

            if(minPrice !== undefined && maxPrice !== undefined){
                if(query.price.$lte < query.price.$gte){
                    return res.status(400).send({error : "max Price must be greater than min Price"})
                }
            }
        }

        let productsQuery = Product.find(query)

        if (sort && !["price_asc", "price_desc"].includes(sort)) {
            return res.status(400).send({
                error: "Invalid sort value"
            })
        }

        if (sort === "price_asc") {
            productsQuery = productsQuery.sort({ price: 1 })
        }

        if (sort === "price_desc") {
            productsQuery = productsQuery.sort({ price: -1 })
        }

        const products = await productsQuery
        

        res.status(200).send(products)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// GET PRODUCT BY ID
router.get('/products/:id'  , async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid product id"})
        }
        const product = await Product.findById(_id)
        if(! product || !product.isActive){
            return res.status(404).send({error : "404 not found"})
        }
        res.status(200).send(product)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// UPDATE PRODUCT BY ID
router.patch('/products/:id' , auth , adminAuth ,upload.single('image'), async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid product id"})
        }

        const allowedFields = ["name", "description", "price" , "stock" , "categoryId"]

        const fields = Object.keys(req.body)

        const isValid = fields.every(field => allowedFields.includes(field))

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid fields"
            })
        }

        const {name , description , price , stock , categoryId} = req.body

        const preProduct = await Product.findById(_id)
        if(! preProduct){
            return res.status(404).send({error : "404 Product not found"})
        }


        if(name){
            const product = await Product.findOne({name})
            if(product && product._id.toString() !== _id){

                return res.status(400).send({error : "name of Product has already been used"})
            } 
        }

        const parsedPrice = price !== undefined ? Number(price) : undefined;
        const parsedStock = stock !== undefined ? Number(stock) : undefined;

        if (price !== undefined && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
            return res.status(400).send({
                error: "Price must be a non-negative number"
            });
        }

        if (stock !== undefined && (Number.isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock))) {
            return res.status(400).send({
                error: "Stock must be a non-negative integer"
            });
        }
        
        if(categoryId){
            if(! mongoose.isValidObjectId(categoryId)){
                return res.status(400).send({error : "Invalid category id"})
            }

            const category = await Category.findById(categoryId)
            if(! category || ! category.isActive){
                return res.status(404).send({error : "404 not found"})
            }
        }

        if (req.file) {
            preProduct.image = req.file.path;
        }
        
        fields.forEach((field) => {
            if (field === "price") {
                preProduct[field] = parsedPrice;
            } else if (field === "stock") {
                preProduct[field] = parsedStock;
            } else {
                preProduct[field] = req.body[field];
            }
        });
        await preProduct.save()

        res.status(200).send(preProduct)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


// ARCHIVE PRODUCT BY ID

router.delete('/products/:id' , auth , adminAuth , async (req , res) => {
    try{

        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid product id"})
        }

        const product = await Product.findById(_id)
        if(! product || ! product.isActive){
            return res.status(404).send({error : "404 Prouduct not found"})
        }

        product.isActive = false
        await product.save()
        res.status(200).send(product)
    }

    catch (error){
        res.status(500).send({error : error.message})
    }
})


module.exports = router