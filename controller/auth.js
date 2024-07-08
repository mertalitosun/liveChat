const Support = require("../models/support");
const bcrypt = require("bcrypt");


exports.get_register = async (req, res) => {
    try {
        return res.render("auth/register", {
            title: "Destek Ekibi Kayıt Sayfası"
        });
    } catch (err) {
        console.log(err);
    }
};

exports.post_register = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await Support.create({
            socketId: null,
            name: name,
            email: email,
            password: hashedPassword
        });
        return res.redirect("login");
    } catch (err) {
        console.log(err);
    }
};

exports.get_login = async (req, res) => {
    try {
        return res.render("auth/login", {
            title: "Destek Ekibi Giriş Yap Sayfası"
        });
    } catch (err) {
        console.log(err);
    }
};

exports.post_login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const support = await Support.findOne({
            where: {
                email: email
            }
        });
        if (!support) {
            return res.render("auth/login", {
                title: "Destek Ekibi Giriş Yap Sayfası",
                message: "Kullanıcı Bulunamadı"
            });
        }

        const match = await bcrypt.compare(password, support.password);
        if (match) {
            const sessionId = req.session.id;
            console.log("Oturum Kimliği:", sessionId);
            
            if(support){
                support.sessionId = sessionId;
                await support.save();
            }
            req.session.isAuth = true;
            req.session.name = support.name
            res.redirect("/admin");
        } else {
            res.render("auth/login", {
                title: "Destek Ekibi Giriş Yap Sayfası",
                message: "Hatalı Parola"
            });
        }
    } catch (err) {
        console.log(err);
    }
};
exports.get_logout = async (req, res) => {
    try {
        res.clearCookie("connect.sid")
        return res.redirect("/login");
    } catch (err) {
        console.log(err);
    }
};
