const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");


router.post("/admin/delete-support/:id",adminController.post_admin_delete_support);

router.get("/team",(req,res,next)=>{
    if(!req.session.isAuth){
        return res.redirect("/login");
    }
    next();
},adminController.get_team);

router.get("/admin",(req,res,next)=>{
    if(!req.session.isAuth){
        return res.redirect("/login");
    }
    next();
},adminController.get_admin)

router.post("/admin",adminController.post_admin)

module.exports = router;