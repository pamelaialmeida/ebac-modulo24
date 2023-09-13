const request = require('supertest');
const { faker } = require('@faker-js/faker');
const { getAccessToken } = require('../utils/request');
const { getProductID } = require('../utils/createProduct');
const { getAddressID } = require('../utils/createAddress');
const { getCustomerID } = require('../utils/createCustomer');
const { getOrderID } = require('../utils/createOrder');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Products', () => {
    let token;

    let description;
    let itemPrice;
    let name;

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    })

    it('(Products GET) Deve listar todos os produtos cadastrados', async () => {
        await request(API_URL)
                .get('/products')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
            })        
    });

    it('(Products GET) Não deve listar produtos quando não está autenticado', async () => {
        await request(API_URL)
                .get('/products')
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Products GET) Deve listar dados de produto pesquisado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .get('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body.description).toBe(description)
                expect(response.body.id).toBe(productID)
                expect(response.body.itemPrice).toBe(itemPrice)
                expect(response.body.name).toBe(name)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Products GET) Deve retornar mensagem de cliente não existente quando cliente pesquisado não está cadastrado', async () => {
        let productID = 'cllxzs7er0074r64so9bshys5';

        await request(API_URL)
                .get('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(404)
                expect(response.body.error).toBe('Not Found')
                expect(response.body.message).toBe(`No resource was found for {\"id\":\"${productID}\"}`)
            })        
    });

    it('(Products POST) Deve cadastrar produto quando todos os dados são enviados com valores válidos', async () => {
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
                expect(response.statusCode).toEqual(201)
                expect(response.body.description).toBe(description)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.itemPrice).toBe(itemPrice)
                expect(response.body.name).toBe(name)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Products POST) Não deve cadastrar produto quando tipo de dado inválidos são enviados', async () => {
        await request(API_URL)
                .post('/products')
                .send({
                    "description": 1,
                    "itemPrice": "price",
                    "name": 2
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(3)
                expect(response.body.message).toContain('description must be a string')
                expect(response.body.message).toContain('itemPrice must be a number conforming to the specified constraints')
                expect(response.body.message).toContain('name must be a string')
            })        
    });

    it('(Products POST) Não deve cadastrar produto quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Products PATCH) Deve alterar dados do produto quando dados enviados são válidos', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.description).toBe(updatedDescription)
                expect(response.body.id).toBe(productID)
                expect(response.body.itemPrice).toBe(updatedItemPrice)
                expect(response.body.name).toBe(upatedName)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Products PATCH) Não deve alterar produto quando id informado não corresponde a id de produto cadastrado', async () => {
        let productID = 'cllxos7er0074r64so9b0hs6t';

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
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Products PATCH) Não deve alterar produto quando tipo de dados inválidos são enviados', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .patch('/products/' + productID)
                .send({
                    "description": 1,
                    "itemPrice": "teste",
                    "name": 2
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(3)
                expect(response.body.message).toContain('description must be a string')
                expect(response.body.message).toContain('itemPrice must be a number conforming to the specified constraints')
                expect(response.body.message).toContain('name must be a string')
            })        
    });

    it('(Products PATCH) Não deve alterar produto quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Products DELETE) Deve deletar produto quando id informado corresponde a id de produto cadastrado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .delete('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body.description).toBe(description)
                expect(response.body.id).toBe(productID)
                expect(response.body.itemPrice).toBe(itemPrice)
                expect(response.body.name).toBe(name)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Products DELETE) Não deve deletar produto quando id informado não corresponde a id de produto cadastrado', async () => {
        let productID = 'cllxzs7er0074r64so9b0hs9t';

        await request(API_URL)
                .delete('/products/' + productID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Products DELETE) Não deve deletar produto quando não está autenticado', async () => {
        description = faker.lorem.sentence();
        itemPrice = faker.number.int({max: 100});
        name = faker.lorem.words({max: 4});

        let productID = await getProductID(token, description, itemPrice, name);

        await request(API_URL)
                .delete('/products/' + productID)
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Products Orders GET) Deve listar pedidos do produto', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
                expect(response.body).toHaveLength(1)
            })        
    });

    it('(Products Orders GET) Não deve listar pedidos do produto quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

});