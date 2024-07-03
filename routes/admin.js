const express = require("express");
const router = express.Router();
const Customer = require("../models/customer")
const Messages = require("../models/messages")



router.get("/admin",async(req,res)=>{
    try{
        const customer = await Customer.findAll()
        const messages = await Messages.findAll()
        res.render("admin/admin",{
            title:"Admin",
            customers:customer,
            messages:messages
        })
    }catch(err){
        console.log(err)
    }
})
router.post("/admin",async(req,res)=>{
    const customerId = req.body.id;
    try {
        await Customer.destroy({ where: { id: customerId } });
        res.redirect('/admin'); 
    } catch (err) {
        console.error(err);
    }
})
module.exports = router;