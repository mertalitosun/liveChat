const express = require("express");
const router = express.Router();
const Customer = require("../models/customer")
router.get("/admin",async(req,res)=>{
    try{
        const customer = await Customer.findAll()
        res.render("admin/admin",{
            title:"Admin",
            customers:customer
        })
    }catch(err){
        console.log(err)
    }
})

module.exports = router;