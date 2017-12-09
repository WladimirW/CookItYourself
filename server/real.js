"use strict";

const express   = require("express"),
    _         = require("lodash"),
    request   = require("request-promise");

var cart;


function getStore(zipCode) {
    console.log(zipCode);
    var storeName;
    var cartId;
    return request({
        uri: "https://api-fab02ext.efood.real-pp.de/api/v2/real/stores/zipCode/"+ zipCode ,
        qs: {
            storeName: "vaos-48606",
            currentPage: 0,
            distance: 500,
            pageSize: 4,
        },
        json: true
    })
        .then(response => {
            storeName= response.stores[0].name;
            return request({
                uri: "https://api-fab02ext.efood.real-pp.de/api/v2/real/users/anonymous/carts",
                json:true,
                method: "POST"
            });
        })

        .then(response => {
            cartId = response.guid;
            //console.log(response);
            cart = "https://api-fab02ext.efood.real-pp.de/api/v2/real/users/anonymous/carts/" + cartId + "/entries/";
            return {cartid:cartId,storeName:storeName};
        })


}
    getStore(40463).then(response => addToCart("Cola", "3", response.storeName))
        .then(response => console.log(response));




function addToCart(ingredient,quantity,storeId){
    return request({
        uri: "https://api-fab02ext.efood.real-pp.de/api/v2/real/products/search",
        qs: {
            query: ingredient + ":relevance:category:1:" + "availableInStores:" + storeId,
            storeName: storeId,
            currentPage: 0,
            fields: "DEFAULT",
            pageSize: 36,
        },
        json: true
    })
        .then(response => {
            //console.log(response.products[0].code);
            //console.log(cart);
            return request({
                uri: cart,
                method: "POST",
                body: {product:{ code: response.products[0].code }, quantity: quantity },
                json: true
            })
                .then(response => {
                    return cart;
                });

        });
}

    module.exports = getStore;