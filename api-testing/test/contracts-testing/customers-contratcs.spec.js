const request = require('supertest');
const { getAccessToken } = require('../../utils/request');
const { getCustomerID } = require('../../utils/createCustomer');
const { faker } = require('@faker-js/faker');
const { getAddressID } = require('../../utils/createAddress');
const { getProductID } = require('../../utils/createProduct');
const { getOrderID } = require('../../utils/createOrder');
const Joi = require ('joi');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Customers', () => {

    let token;

    let email;
    let firstName;
    let lastName;
    let phone;
    let address1;
    let address2;
    let city;
    let state;
    let zip;
    let addressID;

    const customerSchema = Joi.object({
        address: Joi.object({
            id: Joi.string().allow(null).allow('')
        }).allow(null).allow(''),
        createdAt: Joi.string().allow(null).allow(''),
        email: Joi.string().allow(null).allow(''),
        firstName: Joi.string().allow(null).allow(''),
        id: Joi.string().allow(null).allow(''),
        lastName: Joi.string().allow(null).allow(''),
        phone: Joi.string().allow(null).allow(''),
        updatedAt: Joi.string().allow(null).allow('')
    })

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');

        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        addressID = await getAddressID(token, address1, address2, city, state, zip);
    });

    it('Deve validar contrato de customers', async () => {

        const customersSchema = Joi.array().items(
            Joi.object({
                address: Joi.object({
                    id: Joi.string().allow(null).allow('')
                }).allow(null).allow(''),
                createdAt: Joi.string().allow(null).allow(''),
                email: Joi.string().allow(null).allow(''),
                firstName: Joi.string().allow(null).allow(''),
                id: Joi.string().allow(null).allow(''),
                lastName: Joi.string().allow(null).allow(''),
                phone: Joi.string().allow(null).allow(''),
                updatedAt: Joi.string().allow(null).allow('')
            })

        )
                
        await request(API_URL)
                .get('/customers')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return customersSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de cliente pesquisado', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        await request(API_URL)
                .get('/customers/' + customerID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return customerSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de cliente cadastrado', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        await request(API_URL)
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
                return customerSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de usuário alterado', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        let updatedEmail = faker.internet.email();
        let updatedFirstName = faker.person.firstName();
        let updatedLastName = faker.person.lastName();
        let updatedPhone = faker.phone.number();

        await request(API_URL)
                .patch('/customers/' + customerID)
                .send({
                    "address": {
                        "id": addressID
                    },
                    "email": updatedEmail,
                    "firstName": updatedFirstName,
                    "lastName": updatedLastName,
                    "phone": updatedPhone
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return customerSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de cliente excluído', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        await request(API_URL)
                .delete('/customers/' + customerID)
                  .set('Accept', 'application/json')
                  .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return customerSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de pedidos do cliente', async () => {
        const customersOrdersSchema = Joi.array().items(
            Joi.object({
                createdAt: Joi.string().allow(null).allow(''),
                customer: Joi.object({
                    id: Joi.string().allow(null).allow(''),
                }).allow(null).allow(''),
                discount: Joi.number().allow(null).allow(''),
                id: Joi.string().allow(null).allow(''),
                product: Joi.object({
                    id: Joi.string().allow(null).allow(''),
                }).allow(null).allow(''),
                quantity: Joi.number().allow(null).allow(''),
                totalPrice: Joi.number().allow(null).allow(''),
                updatedAt: Joi.string().allow(null).allow('')
            })

        )

        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        //cadastrar produto
        let productDescription = faker.lorem.sentence();
        let itemPrice = faker.number.int({max: 100});
        let productName = faker.lorem.words({max: 4});
        
        let productID = await getProductID(token, productDescription, itemPrice, productName);

        let orderID = await getOrderID(token, customerID, 0, productID, 2, (itemPrice * 2));

        await request(API_URL)
                .get('/customers/' + customerID + '/orders')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return customersOrdersSchema.validateAsync(response.body)
            })        
    });
     
});