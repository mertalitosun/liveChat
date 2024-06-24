const express = require("express");
const router = express.Router();

router.get("/admin",(req,res)=>{
    res.render("admin/admin",{
        title:"Admin"
    })
})

module.exports = router;