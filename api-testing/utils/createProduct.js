const request = require('supertest');
const API_URL = process.env.API_URL;

let getProductID = (token, description, itemPrice, name) => {
    return request(API_URL)
                .post('/products')
                .send({
                    "description": description,
                    "itemPrice": itemPrice,
                    "name": name
                  })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    return response.body.id
                })

}

module.exports = { getProductID }