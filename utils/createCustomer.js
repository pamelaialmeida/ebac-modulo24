const request = require('supertest');
const API_URL = process.env.API_URL;

let getCustomerID = (token, addressID, email, firstName, lastName, phone) => {
    return request(API_URL)
                .post('/customers')
                .send({
                    "address": {
                        "id": addressID
                    },
                    "email": email,
                    "firstName": firstName,
                    "lastName": lastName,
                    "phone": phone
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    return response.body.id
                })

}

module.exports = { getCustomerID }