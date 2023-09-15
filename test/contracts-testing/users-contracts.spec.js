const request = require('supertest');
const { getAccessToken } = require('../../utils/request');
const { getUserID } = require('../../utils/createUser');
const { faker } = require('@faker-js/faker');
const Joi = require ('joi');
const API_URL = process.env.API_URL;

describe('Testes de contratos de Users', () => {

    let token

    let firstName 
    let lastName 
    let password
    let roles 
    let username 

    const userSchema = Joi.object({
        createdAt: Joi.string().allow(null).allow(''),
        firstName: Joi.string().allow(null).allow(''),
        id: Joi.string().allow(null).allow(''),
        lastName: Joi.string().allow(null).allow(''),
        roles: Joi.array().items(Joi.string().allow(null).allow('')),
        updatedAt: Joi.string().allow(null).allow(''),
        username: Joi.string().allow(null).allow('')
    })

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    });

    it('Deve validar contrato de users', async () => {

        const usersSchema = Joi.array().items(
            Joi.object({
                createdAt: Joi.string().allow(null).allow(''),
                firstName: Joi.string().allow(null).allow(''),
                id: Joi.string().allow(null).allow(''),
                lastName: Joi.string().allow(null).allow(''),
                password: Joi.string().allow(null).allow(''),
                roles: Joi.array().items(Joi.string().allow(null).allow('')),
                updatedAt: Joi.string().allow(null).allow(''),
                username: Joi.string().allow(null).allow('')
            })

        )
                
        await request(API_URL)
                .get('/users')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return usersSchema.validateAsync(response.body)
            })
    });
    
    it('Deve validar contrato de usuário pesquisado', async () => {

        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        // Criando usuário para ser utilizado no teste
        userID = await getUserID(token, firstName, lastName, password, roles, username);

        await request(API_URL)
            .get('/users/' + userID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            return userSchema.validateAsync(response.body)
        })
    });
    
   it('Deve validar contrato de usuário cadastrado', async () => {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        await request(API_URL)
                .post('/users')
                .send({
                    "firstName": firstName,
                    "lastName": lastName,
                    "password": password,
                    "roles": roles,
                    "username": username
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return userSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de usuário alterado', async () => {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        // Criando usuário para ser utilizado no teste
        userID = await getUserID(token, firstName, lastName, password, roles, username);

        let updatedFirstName = faker.person.firstName();
        let updatedLastName = faker.person.lastName();
        let updatedPassword = faker.internet.password({length: 10});
        let updatedroles = ["other"];
        let updatedUsername = faker.internet.userName();

        await request(API_URL)
                .patch('/users/' + userID)
                .send({
                    "firstName": updatedFirstName,
                    "lastName": updatedLastName,
                    "password": updatedPassword,
                    "roles": updatedroles,
                    "username": updatedUsername
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return userSchema.validateAsync(response.body)
            })
    });

    it('Deve validar contrato de usuário excluído', async () => {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        // Criando usuário para ser utilizado no teste
        userID = await getUserID(token, firstName, lastName, password, roles, username);

        await request(API_URL)
                .delete('/users/' + userID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                return userSchema.validateAsync(response.body)
            })
    });

    
});