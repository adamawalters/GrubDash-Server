const path = require("path");

//  The dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Function to assign IDs when necessary
const nextId = require("../utils/nextId");


/*Router Handling Functions*/
function listDishes(req, res){
    res.json({data: dishes})
}

function createDish(req, res){
    const {name, description, price, image_url} = res.locals;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

function readDish(req, res){
    const {dish} = res.locals;
    res.json({data: dish})
}

function updateDish(req, res){
    const {dish} = res.locals; //comes from router parameter
    const {name, description, price, image_url} = res.locals; //comes from body
    dish.name = name;
    dish.description = description; 
    dish.price = price; 
    dish.image_url = image_url
    res.json({data : dish})
}

/* Validations */

function bodyHasProperty(propertyName) {
    return function (req, res, next) {
        const {data = {}} = req.body;
        if(data[propertyName]) {
            res.locals[propertyName] = data[propertyName];
            next();
        } else {
            next({
                status: 400, 
                message: `Dish must include a ${propertyName}`
            })
        }
    }
}

function priceIsValid(req, res, next) {
    const {data : {price} = {}} = req.body;
    if( !Number.isInteger(price) || price <= 0) {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    } else {
        next();
    }
}

function dishExists(req, res, next) {
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish) {
        res.locals.dish = foundDish;
        next();
    } else {
        next({
            status: 404,
            message: `Dish ${dishId} not found`
        })
    }
}

function dishIdMatchesRoute(req, res, next) {
    const {dish} = res.locals; //dish found from route parameter
    const dishId = dish.id;
    const {id : updatingDishId} = req.body.data;
    /*If the user has provided an id when updating an existing dish - it needs to match the id of the dish at the URL */
    if((updatingDishId) && (dishId !== updatingDishId)) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${updatingDishId}, Route: ${dish.id}`
        })
    } else {
        next();
    }
}



/*Exports */
module.exports = {
    listDishes,
    createDish: [
        bodyHasProperty("name"),
        bodyHasProperty("description"),
        bodyHasProperty("price"),
        bodyHasProperty("image_url"),
        priceIsValid,
        createDish
    ],
    readDish: [dishExists, readDish],
    updateDish: [
        dishExists,
        bodyHasProperty("name"),
        bodyHasProperty("description"),
        bodyHasProperty("price"),
        bodyHasProperty("image_url"),
        priceIsValid,
        dishIdMatchesRoute, 
        updateDish
    ]

}

