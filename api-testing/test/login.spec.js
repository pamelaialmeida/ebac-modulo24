const request = require('supertest');
const API_URL = process.env.API_URL;

describe('Testes do endpoint de Login', () => {   

    it('(Login) Deve realizar login e retornar o token de acesso', () => {
        request(API_URL)
            .post('/login')
            .send({
                "username": "admin",
                "password": "admin"
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(201)
            expect(response.body.accessToken).not.toBe(undefined)
        })
    });

    it('(Login) Não deve realizar login quando dados não são enviados', () => {
        request(API_URL)
            .post('/login')
            .send({})
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toBeInstanceOf(Array)
            expect(response.body.message).toHaveLength(2)
            expect(response.body.message).toContain('username must be a string')
            expect(response.body.message).toContain('password must be a string')
        })
    });

    it('(Login) Não deve realizar login quando dados de usuário não cadastrado são enviados', () => {
        request(API_URL)
            .post('/login')
            .send({
                "username": "qualquer",
                "password": "qualquer"
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.error).toBe('Unauthorized')
            expect(response.body.message).toBe('The passed credentials are incorrect')
        })
    });

    it('(Login) Não deve realizar login quando senha incorreta é enviada', () => {
        request(API_URL)
            .post('/login')
            .send({
                "username": "admin",
                "password": "qualquer"
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(401)
            expect(response.body.error).toBe('Unauthorized')
            expect(response.body.message).toBe('The passed credentials are incorrect')
        })
    });

    it('(Login) Não deve realizar login quando tipo de dados inválidos são enviados', () => {
        request(API_URL)
            .post('/login')
            .send({
                "username": 1,
                "password": 2
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toBeInstanceOf(Array)
            expect(response.body.message).toHaveLength(2)
            expect(response.body.message).toContain('username must be a string')
            expect(response.body.message).toContain('password must be a string')
        })
    });

    it('(Login) Não deve realizar login quando username não é enviado', () => {
        request(API_URL)
            .post('/login')
            .send({
                "password": "admin"
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toBeInstanceOf(Array)
            expect(response.body.message).toHaveLength(1)
            expect(response.body.message).toContain('username must be a string')
        })
    });

    it('(Login) Não deve realizar login quando senha não é enviada', () => {
        request(API_URL)
            .post('/login')
            .send({
                "username": "admin"
            })
            .set('Accept', 'application/json')
        .then( response => {
            expect(response.statusCode).toEqual(400)
            expect(response.body.error).toBe('Bad Request')
            expect(response.body.message).toBeInstanceOf(Array)
            expect(response.body.message).toHaveLength(1)
            expect(response.body.message).toContain('password must be a string')
        })
    });
});