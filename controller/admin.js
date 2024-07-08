const Customer = require("../models/customer")
const Messages = require("../models/messages")

exports.get_admin = async function(req,res){
    try{
        const customer = await Customer.findAll()
        const messages = await Messages.findAll()
        res.render("admin/admin",{
            title:"Admin",
            customers:customer,
            messages:messages,
            isAuth:req.session.isAuth
        })
    }catch(err){
        console.log(err)
    }
} 

exports.post_admin = async function(req,res){
    const customerId = req.body.id;
    try {
        await Customer.destroy({ where: { id: customerId } });
        res.redirect('/admin'); 
    } catch (err) {
        console.error(err);
    }
} 