const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed")

/* This path: "/orders" */

router.route("/")
                .get(controller.listOrders)
                .post(controller.createOrder)
                .all(methodNotAllowed)


router.route("/:orderId")
                        .get(controller.readOrder)
                        .put(controller.updateOrder)
                        .delete(controller.deleteOrder)
                        .all(methodNotAllowed)


module.exports = router;
