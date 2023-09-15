const request = require('supertest');
const { getAccessToken } = require('../utils/request');
const { getUserID } = require('../utils/createUser');
const { faker } = require('@faker-js/faker');
const API_URL = process.env.API_URL;

describe('Testes do endpoint Users', () => {

    let token

    let firstName 
    let lastName 
    let password
    let roles 
    let username 

    beforeAll( async () => {
        token = await getAccessToken('admin', 'admin');
    });
       
    it('(Users GET) Deve listar todos os usuários cadastrados', async () => {
        
        await request(API_URL)
                .get('/users')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                console.log(JSON.stringify(response))
                expect(response.statusCode).toEqual(200)
                expect(response.body).toBeInstanceOf(Array)
            })
    });

    it('(Users GET) Não deve listar usuários quando não está autenticado', () => {
        request(API_URL)
            .get('/users')
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.message).toBe('Unauthorized')
        })
    });

    it('(Users GET) Deve listar dados de usuário pesquisado', async () => {
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
            expect(response.statusCode).toEqual(200)
            expect(response.body.firstName).toBe(firstName)
            expect(response.body.id).toBe(userID)
            expect(response.body.lastName).toBe(lastName)
            expect(response.body.username).toBe(username)
            expect(response.body.roles).toContain(roles[0])
            expect(response.body).toHaveProperty('createdAt')
            expect(response.body).toHaveProperty('updatedAt')
        })
    });
    
    it('(Users GET) Deve retornar mensagem de usuário não existente quando usuário pesquisado não está cadastrado', async () => {
        userID = 'cllv607oi00rtgr6okc77m4neiwp';

        await request(API_URL)
            .get('/users/' + userID)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)
        .then( response => {
            expect(response.statusCode).toEqual(404)
            expect(response.body.error).toBe('Not Found')
             expect(response.body.message).toBe(`No resource was found for {\"id\":\"${userID}\"}`)
        })
    });

    it('(Users POST) Deve cadastrar usuário quando todos os dados são enviados com valores válidos', async () => {
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
                expect(response.statusCode).toEqual(201)
                expect(response.body.firstName).toBe(firstName)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.lastName).toBe(lastName)
                expect(response.body.username).toBe(username)
                expect(response.body.roles).toContain(roles[0])
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })
    });

    it('(Users POST) Deve cadastrar usuário quando somente os dados obrigatórios são enviados', async () => {
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        await request(API_URL)
                .post('/users')
                .send({
                    "password": password,
                    "roles": roles,
                    "username": username
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(201)
                expect(response.body.id).not.toBe(undefined)
                expect(response.body.username).toBe(username)
                expect(response.body.roles).toContain(roles[0])
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })
    });

    it('(Users POST) Não deve cadastrar usuário quando os dados obrigatórios não são enviados', async () => {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();

        await request(API_URL)
                .post('/users')
                .send({
                    "firstName": firstName,
                    "lastName": lastName
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(3)
                expect(response.body.message).toContain('password must be a string')
                expect(response.body.message).toContain('each value in roles must be a string')
                expect(response.body.message).toContain('username must be a string')
            })
    });

    it('(Users POST) Não deve cadastrar usuário quando tipo de dado inválidos são enviados', async () => {
        firstName = 1;
        lastName = 2;
        password = 3;
        roles = [4];
        username = 5;

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
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('firstName must be a string')
                expect(response.body.message).toContain('lastName must be a string')
                expect(response.body.message).toContain('password must be a string')
                expect(response.body.message).toContain('each value in roles must be a string')
                expect(response.body.message).toContain('username must be a string')
            })
    });

    it('(Users POST) Não deve cadastrar usuário quando não está autenticado', async () => {
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
            .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })
    });

    it('(Users PATCH) Deve alterar dados do usuário quando dados enviados são válidos', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.firstName).toBe(updatedFirstName)
                expect(response.body.id).toBe(userID)
                expect(response.body.lastName).toBe(updatedLastName)
                expect(response.body.username).toBe(updatedUsername)
                expect(response.body.roles).toContain(updatedroles[0])
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })
    });

    it('(Users PATCH) Não deve alterar usuário quando id informado não corresponde a id de usuário cadastrado', async () => {
        await request(API_URL)
                .patch('/users/clov64kfo0084r6okpbmn2ik65')
                .send({
                    "firstName": "Primeiro Nome",
                    "lastName": "Sobrenome",
                    "password": "novaSenha",
                    "roles": ["outra"],
                    "username": "novoUsername"
                })
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })
    });

    it('(Users PATCH) Não deve alterar usuário quando tipo de dados inválidos são enviados', async () => {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        password = faker.internet.password({length: 10});
        roles = ["admin"];
        username = faker.internet.userName();

        // Criando usuário para ser utilizado no teste
        userID = await getUserID(token, firstName, lastName, password, roles, username);

        let updatedFirstName = 1;
        let updatedLastName = 2;
        let updatedPassword = 3;
        let updatedroles = 4;
        let updatedUsername = 5;

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
                expect(response.statusCode).toEqual(400)
                expect(response.body.error).toBe('Bad Request')
                expect(response.body.message).toBeInstanceOf(Array)
                expect(response.body.message).toHaveLength(5)
                expect(response.body.message).toContain('firstName must be a string')
                expect(response.body.message).toContain('lastName must be a string')
                expect(response.body.message).toContain('password must be a string')
                expect(response.body.message).toContain('each value in roles must be a string')
                expect(response.body.message).toContain('username must be a string')
            })
    });

    it('(Users PATCH) Não deve alterar usuário quando id de usuário não é informado', async () => {
        let updatedFirstName = faker.person.firstName();
        let updatedLastName = faker.person.lastName();
        let updatedPassword = faker.internet.password({length: 10});
        let updatedroles = ["other"];
        let updatedUsername = faker.internet.userName();

        await request(API_URL)
                .patch('/users/')
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
                expect(response.statusCode).toEqual(404)
                expect(response.body.error).toBe('Not Found')
                expect(response.body.message).toContain('Cannot PATCH /api/users/')
            })
    });

    it('(Users PATCH) Não deve alterar usuário quando não está autenticado', async () => {
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
             .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })
    });

    it('(Users DELETE) Deve deletar usuário quando id informado corresponde a id de usuário cadastrado', async () => {
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
                expect(response.statusCode).toEqual(200)
                expect(response.body.firstName).toBe(firstName)
                expect(response.body.id).toBe(userID)
                expect(response.body.lastName).toBe(lastName)
                expect(response.body.username).toBe(username)
                expect(response.body.roles).toContain(roles[0])
                expect(response.body).toHaveProperty('createdAt')
                expect(response.body).toHaveProperty('updatedAt')
            })
    });

    it('(Users DELETE) Não deve deletar usuário quando id informado não corresponde a id de usuário cadastrado', async () => {
        userID = 'cllwn9exd002kr69wzta01wwk';

        await request(API_URL)
                .delete('/users/' + userID)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
            .then( response => {
                expect(response.statusCode).toEqual(500)
                expect(response.body.message).toBe('Internal server error')
            })
    });
    
    it('(Users DELETE) Não deve deletar usuário quando não está autenticado', async () => {
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
              .then( response => {
                expect(response.statusCode).toEqual(401)
                expect(response.body.message).toBe('Unauthorized')
            })
    });

});
