const path = require("path");

// The existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Function to assign IDs when necessary
const nextId = require("../utils/nextId");

/* Route handler functions */

function listOrders(req, res) {
    res.json({data: orders})
}

function createOrder(req, res) {
    const {deliverTo, mobileNumber, dishes} = res.locals;
    const {status} = req.body.data;
    const newOrder = {
        id : nextId(),
        deliverTo,
        mobileNumber, 
        status, 
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

function readOrder(req, res) {
    const {order} = res.locals;
    res.json({data: order})
}

function updateOrder(req, res) {
    const {order} = res.locals; //comes from orderExists (order found from url)
    const {deliverTo, mobileNumber, dishes} = res.locals; //comes from bodyHasProperty (body)
    const {status} = res.locals; //comes from statusIsValid (body) 
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.status = status;

    res.json({data: order});
}

function deleteOrder(req, res) {
    const {order: existingOrder} = res.locals;
    const deleteIndex = orders.findIndex(order => order.id === existingOrder.id);
    orders.splice(deleteIndex, 1);
    res.sendStatus(204)
}

/* Validations */

function bodyHasProperty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      res.locals[propertyName] = data[propertyName]; 
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${propertyName}`,
    });
  };
}

function dishPropertyIsValid(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  /*Validate quantity for each dish in dishes */
  const everyDishIsValid = dishes.every((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity < 1 ||
      !Number.isInteger(dish.quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
      return false;
    } else {
        return true;
    }
  });
  /*If no issues with dish property - continue to create the order*/
  if(everyDishIsValid) {
    next();
  }

}

function orderExists(req, res, next) {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if(foundOrder) {
        res.locals.order = foundOrder;
        next();
    } else {
        next({
            status: 404,
            message: `Order ${orderId} not found`
        })
    }
}

function statusIsValid(req, res, next) {
    const {data: {status}} = req.body;
    const existingOrder = res.locals.order;
    const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];
    if(!status) {
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        })
    } else if (!validStatuses.includes(status)) {
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        })
    } else if (existingOrder.status === "delivered") {
        next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    } else {
        res.locals.status = status;
        next();
    }
}

function orderBodyIdMatchesRoute(req, res, next) {
    const {data: {id} = {}} = req.body;
    const routeId = res.locals.order.id; //Id from order that was stored in response
    if(id && (id !== routeId)) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${routeId}.`
        })
    } else {
        next();
    }
}

function deletionStatusIsValid(req, res, next){
    const {order} = res.locals;
    if(order.status !== "pending") {
        next({
            status: 400, 
            message: `An order cannot be deleted unless it is pending`
        })
    } else {
        next();
    }
}

/* Export for use in order router */

module.exports = {
  listOrders,
  createOrder: [
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    dishPropertyIsValid,
    createOrder,
  ],
  readOrder: [orderExists, readOrder],
  updateOrder : [
    orderExists,
    orderBodyIdMatchesRoute,
    statusIsValid,
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    dishPropertyIsValid,
    updateOrder
  ],
  deleteOrder: [orderExists, deletionStatusIsValid, deleteOrder]
};
