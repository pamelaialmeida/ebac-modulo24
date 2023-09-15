const request = require('supertest');
const { getAccessToken } = require('../utils/request');
const { getAddressID } = require('../utils/createAddress');
const { getCustomerID } = require('../utils/createCustomer');
const { faker } = require('@faker-js/faker');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Addresses', () => {

    let token;

    let address1;
    let address2;
    let city;
    let state;
    let zip;

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    });

    it('(Addresses GET) Deve listar todos os endereços cadastrados', async () => {
        await request(API_URL)
            .get('/addresses')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(200)
            expect(response.body).toBeInstanceOf(Array)
        })
    });

    it('(Addresses GET) Não deve listar endereços quando não está autenticado', async () => {
        await request(API_URL)
            .get('/addresses')
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });

    it('(Addresses GET) Deve listar dados de endereço pesquisado', async () => {
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
            expect(response.statusCode).toEqual(200)
            expect(response.body.address_1).toBe(address1)
            expect(response.body.address_2).toBe(address2)
            expect(response.body.city).toBe(city)
            expect(response.body.id).toBe(addressID)
            expect(response.body.state).toBe(state)
            expect(response.body.zip).toBe(zip)
            expect(response.body).toHaveProperty('createdAt')
            expect(response.body).toHaveProperty('updatedAt')
        })
    });

    it('(Addresses GET) Deve retornar mensagem de endereço não existente quando endereço pesquisado não está cadastrado', async () => {
        let addressID = 'cll0o5c5e003ir69wzygiztr8';

        await request(API_URL)
            .get('/addresses/' + addressID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(404)
            expect(response.body.error).toBe('Not Found')
            expect(response.body.message).toBe(`No resource was found for {\"id\":\"${addressID}\"}`)
        })
    });

    it('(Addresses POST) Deve cadastrar endereço quando todos os dados são enviados com valores válidos', async () => {
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
                expect(response.statusCode).toEqual(201)
                expect(response.body.address_1).toBe(address1)
                expect(response.body.address_2).toBe(address2)
                expect(response.body.city).toBe(city)
                expect(response.body.state).toBe(state)
                expect(response.body.zip).toBe(zip)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })
    });

    it('(Addresses POST) Não deve cadastrar endereço quando tipo de dado inválidos são enviados', async () => {
        await request(API_URL)
                .post('/addresses')
                .send({
                    "address_1": 1,
                    "address_2": 2,
                    "city": 3,
                    "state": 4,
                    "zip": "12345"
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('address_1 must be a string')
                expect(response.body.message).toContain('address_2 must be a string')
                expect(response.body.message).toContain('city must be a string')
                expect(response.body.message).toContain('state must be a string')
                expect(response.body.message).toContain('zip must be an integer number')
            })
    });

    it('(Addresses POST) Não deve cadastrar endereço quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })
    });

    it('(Addresses PATCH) Deve alterar dados do endereço quando dados enviados são válidos', async () => {
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
            expect(response.statusCode).toEqual(200)
            expect(response.body.address_1).toBe(updatedAddress1)
            expect(response.body.address_2).toBe(updatedAddress2)
            expect(response.body.city).toBe(updatedCity)
            expect(response.body.id).toBe(addressID)
            expect(response.body.state).toBe(updatedState)
            expect(response.body.zip).toBe(updatedZip)
            expect(response.body).toHaveProperty('createdAt')
            expect(response.body).toHaveProperty('updatedAt')
        })
    });

    it('(Addresses PATCH) Não deve alterar endereço quando id informado não corresponde a id de endereço cadastrado', async () => {
        let addressID = 'cllwo5c5e003ir69wzyg56td0';

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
            expect(response.statusCode).toEqual(500)
            expect(response.body.message).toBe('Internal server error')
        })
    });

    it('(Addresses PATCH) Não deve alterar endereço quando tipo de dados inválidos são enviados', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        let updatedAddress1 = 1;
        let updatedAddress2 = 2;
        let updatedCity = 3;
        let updatedState = 4;
        let updatedZip = "012345";

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
            expect(response.statusCode).toEqual(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toBeInstanceOf(Array)
            expect(response.body.message).toHaveLength(5)
            expect(response.body.message).toContain('address_1 must be a string')
            expect(response.body.message).toContain('address_2 must be a string')
            expect(response.body.message).toContain('city must be a string')
            expect(response.body.message).toContain('state must be a string')
            expect(response.body.message).toContain('zip must be an integer number')
        })
    });

    it('(Addresses PATCH) Não deve alterar endereço quando não está autenticado', async () => {
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
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });

    it('(Addresses DELETE) Deve deletar endereço quando id informado corresponde a id de endereço cadastrado', async () => {
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
            expect(response.statusCode).toEqual(200)
            expect(response.body.address_1).toBe(address1)
            expect(response.body.address_2).toBe(address2)
            expect(response.body.city).toBe(city)
            expect(response.body.id).toBe(addressID)
            expect(response.body.state).toBe(state)
            expect(response.body.zip).toBe(zip)
            expect(response.body).toHaveProperty('createdAt')
            expect(response.body).toHaveProperty('updatedAt')
        })

        await request(API_URL)
            .get('/addresses/' + addressID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(404)
            expect(response.body.error).toBe('Not Found')
            expect(response.body.message).toBe(`No resource was found for {\"id\":\"${addressID}\"}`)
        })
    });

    it('(Addresses DELETE) Não deve deletar endereço quando id informado não corresponde a id de endereço cadastrado', async () => {
        let addressID = 'cllwo5c5e003ir69wzyg56td0';

        await request(API_URL)
            .delete('/addresses/' + addressID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(500)
            expect(response.body.message).toBe('Internal server error')
        })
    });

    it('(Addresses DELETE) Não deve deletar endereço quando não está autenticado', async () => {
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
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });

    it('(Addresses Customers GET) Deve listar todos os clientes cadastrados para o endereço', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        let customerEmail = faker.internet.email();
        let customerFirstName = faker.person.firstName();
        let customerLastName = faker.person.lastName();
        let customerPhone = faker.phone.number();

        let customerID = await getCustomerID(token, addressID, customerEmail, customerFirstName, customerLastName, customerPhone);

        await request(API_URL)
            .get('/addresses/' + addressID + '/customers')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(200)
            expect(response.body).toBeInstanceOf(Array)
            expect(response.body[0].address.id).toBe(addressID)
            expect(response.body[0].email).toBe(customerEmail)
            expect(response.body[0].firstName).toBe(customerFirstName)
            expect(response.body[0].id).toBe(customerID)
            expect(response.body[0].lastName).toBe(customerLastName)
            expect(response.body[0].phone).toBe(customerPhone)
            expect(response.body[0]).toHaveProperty('createdAt')
            expect(response.body[0]).toHaveProperty('updatedAt')
        })
    });

    it('(Addresses Customers GET) Não deve listar os clientes cadastrados para o endereço quando não está autenticado', async () => {
        address1 = faker.location.street();
        address2 = faker.location.street();
        city = faker.location.city();
        state = faker.location.state();
        zip = faker.number.int({min: 10000, max: 100000});

        // Criando endereço para ser utilizado no teste
        let addressID = await getAddressID(token, address1, address2, city, state, zip);

        await request(API_URL)
            .get('/addresses/' + addressID + '/customers')
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });
   
});