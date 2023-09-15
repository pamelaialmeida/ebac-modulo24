const request = require('supertest');

let getAccessToken = (user, password) => {
    return request('http://localhost:3000/api')
                .post('/login')
                .send({
                    "username": user,
                    "password": password
                })
                .set('Accept', 'application/json')
                .then( response => {
                    console.log(JSON.stringify(response))
                    return response.body.accessToken
                })

}

module.exports = { getAccessToken }
