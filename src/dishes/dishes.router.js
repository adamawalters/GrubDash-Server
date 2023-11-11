const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/")
                .get(controller.listDishes)
                .post(controller.createDish)
                .all(methodNotAllowed)


router.route("/:dishId")
                        .get(controller.readDish)
                        .put(controller.updateDish)
                        .all(methodNotAllowed)


module.exports = router;
