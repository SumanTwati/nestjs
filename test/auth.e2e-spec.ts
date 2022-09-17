import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handles a signup request', () => {
        const email = 'test12@test.com';
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: email, password: 'pwd' })
            .expect(201)
            .then((res) => {
                const { id, email } = res.body;
                expect(id).toBeDefined();
                expect(email).toEqual(email);
            });
    });

    it('singup as a new user then get the currently logged in user',async()=>{
        const email = '';
       const res = request(app.getHttpServer)
        .post('/auth/singup')
        .send({email:email,password:'pwd'})
        .expect(201);

        const cookie = res.get('Set-Cookie');

       const {body} =  await request(app.getHttpServer)
        .get('/auth/who-am-i')
        .set('Cookie',cookie)
        .expect(200)

        expect(body.email).toEqual(email);
    })
});
