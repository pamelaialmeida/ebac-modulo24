const request = require('supertest');
const API_URL = process.env.API_URL;

let getAddressID = (token, address1, address2, city, state, zip) => {
    return request(API_URL)
                .post('/addresses')
                .send({
                    "address_1": address1,
                    "address_2": address2,
                    "city": city,
                    "state": state,
                    "zip": zip
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    return response.body.id
                })

}

module.exports = { getAddressID }