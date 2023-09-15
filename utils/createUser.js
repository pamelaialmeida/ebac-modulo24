const request = require('supertest');
const API_URL = process.env.API_URL;

let getUserID = (token, firstName, lastName, password, roles, username) => {
    return request(API_URL)
                .post('/users')
                .send({
                    "firstName": firstName,
                    "lastName": lastName,
                    "password": password,
                    "roles": roles,
                    "username": username
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    return response.body.id
                })

}

module.exports = { getUserID }