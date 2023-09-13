const request = require('supertest');
const { faker } = require('@faker-js/faker');
const { getOrderID } = require('../utils/createOrder');
const { getAccessToken } = require('../utils/request');
const { getProductID } = require('../utils/createProduct');
const { getAddressID } = require('../utils/createAddress');
const { getCustomerID } = require('../utils/createCustomer');
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
    
    it('(Orders GET) Deve listar todos os pedidos cadastrados', async () => {
        await request(API_URL)
                .get('/orders')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
            })        
    });

    it('(Orders GET) Não deve listar pedidos quando não está autenticado', async () => {
        await request(API_URL)
                .get('/orders')
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Orders GET) Deve listar dados de pedido pesquisado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        await request(API_URL)
                .get('/orders/' + orderID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body.customer.id).toBe(customerID)
                expect(response.body.discount).toBe(discount)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.product.id).toBe(productID)
                expect(response.body.quantity).toBe(quantity)
                expect(response.body.totalPrice).toBe(totalPrice)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Orders GET) Deve retornar mensagem de pedido não existente quando pedido pesquisado não está cadastrado', async () => {
        let orderID = 'cllxzs7er0074r64so9bshys5';

        await request(API_URL)
                .get('/orders/' + orderID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(404)
                expect(response.body.error).toBe('Not Found')
                expect(response.body.message).toBe(`No resource was found for {\"id\":\"${orderID}\"}`)
            })        
    });

    it('(Orders POST) Deve cadastrar pedido quando todos os dados são enviados com valores válidos', async () => {
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
                expect(response.statusCode).toEqual(201)
                expect(response.body.customer.id).toBe(customerID)
                expect(response.body.discount).toBe(discount)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.product.id).toBe(productID)
                expect(response.body.quantity).toBe(quantity)
                expect(response.body.totalPrice).toBe(totalPrice)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Orders POST) Não deve cadastrar pedido quando tipo de dado inválidos são enviados', async () => {
        await request(API_URL)
                .post('/orders')
                .send({
                    "customer": {
                        "id": 1
                      },
                      "discount": "discount",
                      "product": {
                        "id": 2
                      },
                      "quantity": "quantity",
                      "totalPrice": "totalPrice"
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('customer.id must be a string')
                expect(response.body.message).toContain('discount must be a number conforming to the specified constraints')
                expect(response.body.message).toContain('product.id must be a string')
                expect(response.body.message).toContain('quantity must be an integer number')
                expect(response.body.message).toContain('totalPrice must be an integer number')
            })        
    });

    it('(Orders POST) Não deve cadastrar pedido quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Orders PATCH) Deve alterar dados do pedido quando dados enviados são válidos', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.customer.id).toBe(newCustomerID)
                expect(response.body.discount).toBe(discount)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.product.id).toBe(newProductID)
                expect(response.body.quantity).toBe(updatedQuantity)
                expect(response.body.totalPrice).toBe(updatedTotalPrice)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Orders PATCH) Não deve alterar pedido quando id informado não corresponde a id de pedido cadastrado', async () => {
        let orderID = 'cllxos7er0074r64so9b0hs6t';

        let updatedQuantity = faker.number.int({max: 5});
        let updatedTotalPrice = (productItemPrice * quantity);

        await request(API_URL)
                .patch('/orders/' + productID)
                .send({
                    "customer": {
                      "id": customerID
                    },
                    "discount": discount,
                    "product": {
                      "id": productID
                    },
                    "quantity": updatedQuantity,
                    "totalPrice": updatedTotalPrice
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Orders PATCH) Não deve alterar pedido quando tipo de dados inválidos são enviados', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        let updatedQuantity = faker.number.int({max: 5});
        let updatedTotalPrice = (productItemPrice * quantity);


        await request(API_URL)
                .patch('/orders/' + orderID)
                .send({
                    "customer": {
                      "id": 1
                    },
                    "discount": "discount",
                    "product": {
                      "id": 2
                    },
                    "quantity": "updatedQuantity",
                    "totalPrice": "updatedTotalPrice"
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('customer.id must be a string')
                expect(response.body.message).toContain('discount must be a number conforming to the specified constraints')
                expect(response.body.message).toContain('product.id must be a string')
                expect(response.body.message).toContain('quantity must be an integer number')
                expect(response.body.message).toContain('totalPrice must be an integer number')
            })        
    });

    it('(Orders PATCH) Não deve alterar pedido quando não está autenticado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        let updatedQuantity = faker.number.int({max: 5});
        let updatedTotalPrice = (productItemPrice * quantity);

        await request(API_URL)
                .patch('/orders/' + orderID)
                .send({
                    "quantity": updatedQuantity,
                    "totalPrice": updatedTotalPrice
                })
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Orders DELETE) Deve deletar pedido quando id informado corresponde a id de pedido cadastrado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        await request(API_URL)
                .delete('/orders/' + orderID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body.customer.id).toBe(customerID)
                expect(response.body.discount).toBe(discount)
                expect(response.body.id).toBe(orderID)
                expect(response.body.product.id).toBe(productID)
                expect(response.body.quantity).toBe(quantity)
                expect(response.body.totalPrice).toBe(totalPrice)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Orders DELETE) Não deve deletar pedido quando id informado não corresponde a id de pedido cadastrado', async () => {
        let orderId = 'cllxzs7er0074r64so9b0hs9t';

        await request(API_URL)
                .delete('/orders/' + orderId)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Orders DELETE) Não deve deletar pedido quando não está autenticado', async () => {
        quantity = faker.number.int({max: 5});
        totalPrice = (productItemPrice * quantity);

        let orderID = await getOrderID(token, customerID, discount, productID, quantity, totalPrice);

        await request(API_URL)
                .delete('/orders/' + orderID)
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

});