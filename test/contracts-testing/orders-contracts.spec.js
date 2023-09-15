const request = require('supertest');
const { faker } = require('@faker-js/faker');
const { getOrderID } = require('../../utils/createOrder');
const { getAccessToken } = require('../../utils/request');
const { getProductID } = require('../../utils/createProduct');
const { getAddressID } = require('../../utils/createAddress');
const { getCustomerID } = require('../../utils/createCustomer');
const Joi = require ('joi');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Orders', () => {
    let token;

    let productDescription;
    let productItemPrice;
    let productName;
    let productID;

    let address1;
    let address2;
    let city;
    let state;
    let zip;
    let addressID;

    let customerEmail;
    let customerFirstName;
    let customerLastName;
    let customerPhone;
    let customerID;

    let discount = 0;
    let quantity;
    let totalPrice;

    const orderSchema = Joi.object({
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

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');

        productDescription = faker.lorem.sentence();
        productItemPrice = faker.number.int({max: 100});
        productName = faker.lorem.words({max: 4});

        productID = await getProductID(token, productDescription, productItemPrice, productName);

        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        addressID = await getAddressID(token, address1, address2, city, state, zip);

        customerEmail = faker.internet.email();
        customerFirstName = faker.person.firstName();
        customerLastName = faker.person.lastName();
        customerPhone = faker.phone.number();

        customerID = await getCustomerID(token, addressID, customerEmail, customerFirstName, customerLastName, customerPhone);
    })

    it('Deve validar contrato de orders', async () => {

        const ordersSchema = Joi.array().items(
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
                
        await request(API_URL)
                .get('/orders')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return ordersSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de pedido pesquidado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        await request(API_URL)
                .get('/orders/' + orderID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return orderSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto cadastrado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        await request(API_URL)
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
                return orderSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto alterado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);
        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        // Gerando novo produto pra atualiar id de produto no pedido
        productDescription = faker.lorem.sentence();
        productItemPrice = faker.number.int({max: 100});
        productName = faker.lorem.words({max: 4});

        let newProductID = await getProductID(token, productDescription, productItemPrice, productName);

        // Gerando novo cliente pra atualiar id de cliente no pedido
        customerEmail = faker.internet.email();
        customerFirstName = faker.person.firstName();
        customerLastName = faker.person.lastName();
        customerPhone = faker.phone.number();

        let newCustomerID = await getCustomerID(token, addressID, customerEmail, customerFirstName, customerLastName, customerPhone);

        let updatedQuantity = faker.number.int({max: 5});
        let updatedTotalPrice = (productItemPrice * quantity);

       
        await request(API_URL)
                .patch('/orders/' + orderID)
                .send({
                    "customer": {
                        "id": newCustomerID
                      },
                      "discount": discount,
                      "product": {
                        "id": newProductID
                      },
                      "quantity": updatedQuantity,
                      "totalPrice": updatedTotalPrice
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return orderSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto excluído', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        await request(API_URL)
                .delete('/orders/' + orderID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return orderSchema.validateAsync(response.body)
            })        
    });

});