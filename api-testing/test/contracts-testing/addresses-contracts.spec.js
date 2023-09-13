const request = require('supertest');
const { getAccessToken } = require('../../utils/request');
const { getAddressID } = require('../../utils/createAddress');
const { getCustomerID } = require('../../utils/createCustomer');
const { faker } = require('@faker-js/faker');
const Joi = require ('joi');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Addresses', () => {

    let token;

    let address1;
    let address2;
    let city;
    let state;
    let zip;

    const addressSchema =  Joi.object({
        address_1: Joi.string().allow(null).allow(''),
        address_2: Joi.string().allow(null).allow(''),
        city: Joi.string().allow(null).allow(''),
        createdAt: Joi.string().allow(null).allow(''),
        id: Joi.string().allow(null).allow(''),
        state: Joi.string().allow(null).allow(''),
        updatedAt: Joi.string().allow(null).allow(''),
        zip: Joi.number().allow(null).allow('')
    })

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    });

    it('Deve validar contrato de addresses', async () => {

        const addressesSchema = Joi.array().items(
            Joi.object({
                address_1: Joi.string().allow(null).allow(''),
                address_2: Joi.string().allow(null).allow(''),
                city: Joi.string().allow(null).allow(''),
                createdAt: Joi.string().allow(null).allow(''),
                id: Joi.string().allow(null).allow(''),
                state: Joi.string().allow(null).allow(''),
                updatedAt: Joi.string().allow(null).allow(''),
                zip: Joi.number().allow(null).allow('')
            })

        )
                
        await request(API_URL)
                .get('/addresses')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return addressesSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de endereço pesquisado', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        await request(API_URL)
            .get('/addresses/' + addressID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            return addressSchema.validateAsync(response.body)
        })
    });

    it('Deve validar contrato de endereço cadastrado', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        await request(API_URL)
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
                return addressSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de endereço alterado', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        let updatedAddress1 = faker.location.street();
        let updatedAddress2 = faker.location.street();
        let updatedCity = faker.location.city();
        let updatedState = faker.location.state();
        let updatedZip = faker.number.int({min: 10000, max: 100000});

        await request(API_URL)
            .patch('/addresses/' + addressID)
            .send({
                "address_1": updatedAddress1,
                "address_2": updatedAddress2,
                "city": updatedCity,
                "state": updatedState,
                "zip": updatedZip
            })
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            return addressSchema.validateAsync(response.body)
        })
    });

    it('Deve validar contrato de endereço excluído', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        await request(API_URL)
            .delete('/addresses/' + addressID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            return addressSchema.validateAsync(response.body)
        })
        
    });   
   
});