const request = require('supertest');
const Joi = require('joi');
const API_URL = process.env.API_URL;

describe('Testes do endpoint de Login', () => {

    it('Deve validar contrato de products', async () => {

        const loginSchema = Joi.object({
            accessToken: Joi.string().required(),
            username: Joi.string(),
            roles: Joi.array().items(Joi.string().allow(null).allow(''))
        })

         await request(API_URL)
                .post('/login')
                .send({
                    "username": "admin",
                    "password": "admin"
                })
                .set('Accept', 'application/json')
            .then( response => {
                return loginSchema.validateAsync(response.body)
            })
    });
});