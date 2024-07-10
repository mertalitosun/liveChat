const Support = require("../models/support");
const Customer = require("../models/customer");
const Messages = require("../models/messages");
const Suggestion = require("../models/suggestion");


exports.post_admin_edit_support = async(req,res)=>{
    const supportId = req.params.id;
    const supportName = req.body.supportName;
    try{
        const supports = await Support.findOne({where:{
            id:supportId
        }});
        supports.name = supportName;
        await supports.save();
        res.redirect("/team")
    }catch(err){
        console.log(err)
    }
}
exports.get_admin_edit_support = async(req,res)=>{
    const supportId = req.params.id
    try{
        const supports = await Support.findOne({where:{
            id:supportId
        }});
        res.render("admin/teams/team-edit",{
            title: "Kullanıcı Adı Güncelle",
            name:supports.name,
        })
    }catch(err){
        console.log(err)
    }
}
exports.post_admin_edit_suggest = async(req,res)=>{
    const suggestionId = req.params.id;
    const newMessage = req.body.suggestedMessage;
    const newIsVisible = req.body.isVisible;
    const isVisibleValue = newIsVisible === 'on';
    try{
        const suggestedMessage = await Suggestion.findOne({where:{
            id:suggestionId
        }});
        suggestedMessage.message = newMessage;
        suggestedMessage.isVisible = isVisibleValue
        await suggestedMessage.save();
        res.redirect("/settings")
    }catch(err){
        console.log(err)
    }
}
exports.get_admin_edit_suggest = async(req,res)=>{
    const suggestionId = req.params.id
    try{
        const suggestedMessage = await Suggestion.findOne({where:{
            id:suggestionId
        }});
        res.render("admin/settings/suggestion-edit",{
            title: "Önerilen Mesaj Güncelle",
            message:suggestedMessage.message,
            isVisible: suggestedMessage.isVisible
        })
    }catch(err){
        console.log(err)
    }
}
exports.post_admin_create_suggest = async(req,res)=>{
    const message = req.body.suggestedMessage;
    const isVisible = req.body.isVisible;
    const isVisibleValue = isVisible === 'on';
    try{
        await Suggestion.create({
            message:message,
            isVisible:isVisibleValue
        });
        res.redirect("/settings");
    }catch(err){
        console.log(err)
    }
}
exports.get_admin_create_suggest = async(req,res)=>{
    res.render("admin/settings/suggestion-create",{
        title:"Önerilen Mesaj Ekle",
    })
}
exports.post_admin_delete_suggest = async(req,res)=>{
    const suggestionId = req.params.id;
    try{
        await Suggestion.destroy({where:{id:suggestionId}})
        res.redirect("/settings")
    }catch(err){
        console.log(err)
    }
}
exports.get_admin_delete_suggest = async(req,res)=>{
    const suggestionId = req.params.id;
    try{
        const suggestions = await Suggestion.findAll({where:{
            id:suggestionId
        }})
        res.render("admin/settings/suggestion-delete",{
            title:"Önerilen Mesaj Sil",
            suggestions:suggestions,
        })
    }catch(err){
        console.log(err)
    }
}
exports.post_admin_delete_support = async (req,res)=>{
    const supportId = req.params.id;
    try {
        await Support.destroy({ where: { id: supportId } });
        res.redirect("/team");
    } catch (err) {
        console.error(err);
    }
}
exports.get_admin_delete_support = async (req,res)=>{
    const supportId = req.params.id;
    try {
        const supports = await Support.findOne({ where: { id: supportId } });
        res.render("admin/teams/team-delete",{
            title:"Kullanıcı Mesaj Sil",
            supports:supports,
        })
    } catch (err) {
        console.error(err);
    }
}
exports.get_settings = async function(req,res){
    try{
        const suggestions = await Suggestion.findAll()
        res.render("admin/settings/settings",{
            title:"Destek Ekibi",
            suggestions:suggestions,
        })
    }catch(err){
        console.log(err)
    }
} 
exports.get_team = async function(req,res){
    try{
        const support = await Support.findAll()
        res.render("admin/teams/team",{
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
//müşteri  sil
exports.post_admin = async function(req,res){
    const customerId = req.body.id;
    try {
        await Customer.destroy({ where: { id: customerId } });
        res.redirect('/admin'); 
    } catch (err) {
        console.error(err);
    }
} 