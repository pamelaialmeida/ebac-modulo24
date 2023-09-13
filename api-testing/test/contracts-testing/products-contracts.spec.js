const request = require('supertest');
const { faker } = require('@faker-js/faker');
const { getAccessToken } = require('../../utils/request');
const { getProductID } = require('../../utils/createProduct');
const { getAddressID } = require('../../utils/createAddress');
const { getCustomerID } = require('../../utils/createCustomer');
const { getOrderID } = require('../../utils/createOrder');
const Joi = require ('joi');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Products', () => {
    let token;

    let description;
    let itemPrice;
    let name;

    const productSchema = Joi.object({
        createdAt: Joi.string().allow(null).allow(''),
        description: Joi.string().allow(null).allow(''),
        id: Joi.string().allow(null).allow(''),
        itemPrice: Joi.number().allow(null).allow(''),
        name: Joi.string().allow(null).allow(''),
        updatedAt: Joi.string().allow(null).allow('')
    })

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    })

    it('Deve validar contrato de produtos', async () => {

        const productsSchema = Joi.array().items(
            Joi.object({
                createdAt: Joi.string().allow(null).allow(''),
                description: Joi.string().allow(null).allow(''),
                id: Joi.string().allow(null).allow(''),
                itemPrice: Joi.number().allow(null).allow(''),
                name: Joi.string().allow(null).allow(''),
                updatedAt: Joi.string().allow(null).allow('')
            })

        )
                
        await request(API_URL)
                .get('/products')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productsSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de produto pesquisado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .get('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto cadastrado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        await request(API_URL)
                .post('/products')
                .send({
                    "description": description,
                    "itemPrice": itemPrice,
                    "name": name
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto atualizado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        let updatedDescription = faker.lorem.sentence();
        let updatedItemPrice = faker.number.int({max: 100});
        let upatedName = faker.lorem.words({max: 4}); 

        await request(API_URL)
                .patch('/products/' + productID)
                .send({
                    "description": updatedDescription,
                    "itemPrice": updatedItemPrice,
                    "name": upatedName
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de produto excluído', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .delete('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productSchema.validateAsync(response.body)
            })        
    });

    it('Deve validar contrato de pedidos do produto', async () => {
        const productOrdersSchema = Joi.array().items(
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

        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});
        
        let productID = await getProductID(token, description, itemPrice, name);

        //cadastrar address
        let address1 = faker.location.street();
        let address2 = faker.location.street();
        let city = faker.location.city();
        let state = faker.location.state();
        let zip = faker.number.int({min: 10000, max: 100000});

        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        //cadastrar customer
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        //cadastrar order
        let orderID = await getOrderID(token, customerID, 0, productID, 2, (itemPrice * 2));

        await request(API_URL)
                .get('/products/' + productID + '/orders')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return productOrdersSchema.validateAsync(response.body)
            })        
    });

});