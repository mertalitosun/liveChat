const Suggestion = require("../models/suggestion");

exports.index = async function(req,res){
    try{
        const suggestions = await Suggestion.findAll();
        res.render("users/index",{
            title:"Users",
            suggestions: suggestions
        })
    }catch(err){
        console.log(err)
    }
   
}