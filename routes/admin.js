const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const isAuth = require("../middlewares/auth");


router.post("/admin/edit-suggestion/:id",isAuth,adminController.post_admin_edit_suggest);
router.get("/admin/edit-suggestion/:id",isAuth,adminController.get_admin_edit_suggest);
router.post("/admin/suggestion-create",isAuth,adminController.post_admin_create_suggest);
router.get("/admin/suggestion-create",isAuth,adminController.get_admin_create_suggest);
router.post("/admin/delete-suggestion/:id",isAuth,adminController.post_admin_delete_suggest);
router.get("/admin/delete-suggestion/:id",isAuth,adminController.get_admin_delete_suggest);

router.post("/admin/edit-support/:id",isAuth,adminController.post_admin_edit_support);
router.get("/admin/edit-support/:id",isAuth,adminController.get_admin_edit_support);
router.post("/admin/delete-support/:id",isAuth,adminController.post_admin_delete_support);
router.get("/admin/delete-support/:id",isAuth,adminController.get_admin_delete_support);

router.get("/settings/suggestion-messages",isAuth,adminController.get_suggestion_messages);
router.get("/settings",isAuth,adminController.get_settings);
router.get("/team",isAuth,adminController.get_team);
router.get("/admin",isAuth,adminController.get_admin);
router.post("/admin",isAuth,adminController.post_admin);

module.exports = router;