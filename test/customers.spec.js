const request = require('supertest');
const { getAccessToken } = require('../utils/request');
const { getCustomerID } = require('../utils/createCustomer');
const { faker } = require('@faker-js/faker');
const { getAddressID } = require('../utils/createAddress');
const { getProductID } = require('../utils/createProduct');
const { getOrderID } = require('../utils/createOrder');
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

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');

        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        addressID = await getAddressID(token, address1, address2, city, state, zip);
    });
   
    it('(Customers GET) Deve listar todos os clientes cadastrados', async () => {
        await request(API_URL)
                .get('/customers')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
            })        
    });

    it('(Customers GET) Não deve listar clientes quando não está autenticado', async () => {
        await request(API_URL)
                .get('/customers')
                .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Customers GET) Deve listar dados de cliente pesquisado', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.address.id).toBe(addressID)
                expect(response.body.email).toBe(email)
                expect(response.body.firstName).toBe(firstName)
                expect(response.body.id).toBe(customerID)
                expect(response.body.lastName).toBe(lastName)
                expect(response.body.phone).toBe(phone)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Customers GET) Deve retornar mensagem de cliente não existente quando cliente pesquisado não está cadastrado', async () => {
        let customerID = 'cllxzs7er0074r64so9b0hks3';

        await request(API_URL)
                .get('/customers/' + customerID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(404)
                expect(response.body.error).toBe('Not Found')
                expect(response.body.message).toBe(`No resource was found for {\"id\":\"${customerID}\"}`)
            })        
    });

    it('(Customers POST) Deve cadastrar cliente quando todos os dados são enviados com valores válidos', async () => {
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
                expect(response.statusCode).toEqual(201)
                expect(response.body.address.id).toBe(addressID)
                expect(response.body.email).toBe(email)
                expect(response.body.firstName).toBe(firstName)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.lastName).toBe(lastName)
                expect(response.body.phone).toBe(phone)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Customers POST) Não deve cadastrar cliente quando tipo de dado inválidos são enviados', async () => {
        await request(API_URL)
                .post('/customers')
                .send({
                    "address": {
                        "id": 1
                    },
                    "email": 2,
                    "firstName": 3,
                    "lastName": 4,
                    "phone": 5
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('address.id must be a string')
                expect(response.body.message).toContain('email must be a string')
                expect(response.body.message).toContain('firstName must be a string')
                expect(response.body.message).toContain('lastName must be a string')
                expect(response.body.message).toContain('phone must be a string')
            })        
    });

    it('(Customers POST) Não deve cadastrar cliente quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Customers PATCH) Deve alterar dados do cliente quando dados enviados são válidos', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.address.id).toBe(addressID)
                expect(response.body.email).toBe(updatedEmail)
                expect(response.body.firstName).toBe(updatedFirstName)
                expect(response.body.id).toBe(customerID)
                expect(response.body.lastName).toBe(updatedLastName)
                expect(response.body.phone).toBe(updatedPhone)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Customers PATCH) Não deve alterar cliente quando id informado não corresponde a id de cliente cadastrado', async () => {
        let customerID = 'cllxzs7er0074r64so9b0hs9t';

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
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Customers PATCH) Não deve alterar cliente quando tipo de dados inválidos são enviados', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        await request(API_URL)
                .patch('/customers/' + customerID)
                .send({
                    "address": {
                        "id": 1
                    },
                    "email": 2,
                    "firstName": 3,
                    "lastName": 4,
                    "phone": 5
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('address.id must be a string')
                expect(response.body.message).toContain('email must be a string')
                expect(response.body.message).toContain('firstName must be a string')
                expect(response.body.message).toContain('lastName must be a string')
                expect(response.body.message).toContain('phone must be a string')
            })        
    });

    it('(Customers PATCH) Não deve alterar cliente quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Customers DELETE) Deve deletar cliente quando id informado corresponde a id de cliente cadastrado', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.address.id).toBe(addressID)
                expect(response.body.email).toBe(email)
                expect(response.body.firstName).toBe(firstName)
                expect(response.body.id).toBe(customerID)
                expect(response.body.lastName).toBe(lastName)
                expect(response.body.phone).toBe(phone)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })        
    });

    it('(Customers DELETE) Não deve deletar cliente quando id informado não corresponde a id de cliente cadastrado', async () => {
        let customerID = 'cllxzs7er0074r64so9b0hs9t';

        await request(API_URL)
                .delete('/customers/' + customerID)
                  .set('Accept', 'application/json')
                  .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })        
    });

    it('(Customers DELETE) Não deve deletar cliente quando não está autenticado', async () => {
        email = faker.internet.email();
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        phone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, email, firstName, lastName, phone);

        await request(API_URL)
                .delete('/customers/' + customerID)
                  .set('Accept', 'application/json')
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });

    it('(Customers Orders GET) Deve listar pedidos do cliente', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
                expect(response.body).toHaveLength(1)
            })        
    });

    it('(Customers Orders GET) Não deve listar pedidos do cliente quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })        
    });
    
});