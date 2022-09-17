import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'test@test.com', password: 'pwd' } as User);
      },
      findByEmail: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'rndPwd' } as User]);
      },
      findAll: () => {
        return Promise.resolve([{ id: 1, email: 'test@test.com', password: 'pwd' } as User]);
      },
      // remove: () => {

      // },
      //   update: () => {

      //   }
    };
    fakeAuthService = {
      // singup: (email: string, password: string) => {
      //   return Promise.resolve([{ id: 1, email, password } as User]);
      // },
      singin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: fakeUserService
      },
      {
        provide: AuthService,
        useValue: fakeAuthService
      }]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers();
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns a user with given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  })

  it('findUser throw an exception if user with given id is not found', async () => {
    fakeUserService.findOne = () => null;
    expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  })

  it('findAllUsersByEmail returns a user with given email', async () => {
    const user = await controller.findAllUsersByEmail('test@test.com');
    expect(user).toBeDefined();
    expect(user[0].email).toEqual('test@test.com');
  })

  // it('findAllUsersByEmail throw an exception if user with given email is not found', async () => {
  //   fakeUserService.findByEmail = () => null;
  //   expect(controller.findAllUsersByEmail('test@test.com')).rejects.toThrow(NotFoundException);
  // })

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin({ email: 'test@test.com', password: 'pwd' },
      session);

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  })
});
