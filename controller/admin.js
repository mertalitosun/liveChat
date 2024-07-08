const Support = require("../models/support");
const Customer = require("../models/customer");
const Messages = require("../models/messages");


exports.post_admin_delete_support = async (req,res)=>{
    const supportId = req.params.id;
    try {
        await Support.destroy({ where: { id: supportId } });
        res.redirect("/team");
    } catch (err) {
        console.error(err);
    }
}

exports.get_team = async function(req,res){
    try{
        const support = await Support.findAll()
        res.render("admin/team",{
            title:"Destek Ekibi",
            supports:support,
        })
    }catch(err){
        console.log(err)
    }
} 
exports.get_admin = async function(req,res){
    try{
        const customer = await Customer.findAll()
        const messages = await Messages.findAll()
        res.render("admin/admin",{
            title:"Destek Ekibi",
            customers:customer,
            messages:messages,
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