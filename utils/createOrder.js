const request = require('supertest');
const API_URL = process.env.API_URL;

let getOrderID = (token, customerID, discount, productID, quantity, totalPrice) => {
    return request(API_URL)
                .post('/orders')
                .send({
                    "customer": {
                      "id": customerID
                    },
                    "discount": discount,
                    "product": {
                      "id": productID
                    },
                    "quantity": quantity,
                    "totalPrice": totalPrice
                  })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    return response.body.id
                })
}

module.exports = { getOrderID }