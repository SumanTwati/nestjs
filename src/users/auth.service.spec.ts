import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UsersService>;

    beforeEach(async () => {
        // create a fake copy of the user service
        const users: User[] = [];
        fakeUserService = {
            findByEmail: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 99999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            }
        }

        const module = await Test.createTestingModule({
            providers: [AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUserService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('create a new user with a salted and hashed password', async () => {
        const user = await service.singup('test@test.com', 'pwd');
        expect(user.password).not.toEqual('pwd');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an exception if user signs up with email that is in use', async () => {
        //fakeUserService.findByEmail = () => Promise.resolve([{ id: 1, email: 'test1@test.com', password: 'pwd' } as User]);
        await service.singup('test1@test.com','anyPwd');
        await expect(service.singup('test1@test.com', 'pwd')).rejects.toThrow(BadRequestException);
    })

    it('throws an exception if signs is called with an unused email', async () => {
        await expect(service.singin('test1@test.com', 'pwd')).rejects.toThrow(NotFoundException);
    })

    it('throws if an invalid passwor is provided', async () => {
        //fakeUserService.findByEmail = () => Promise.resolve([{ id: 1, email: 'test1@test.com', password: 'pwd' } as User]);
        await service.singup('test2@test.com','diffPwd');
        await expect(service.singin('test2@test.com', 'pwd')).rejects.toThrow(BadRequestException);
    })

    it('returns a user if correct password is provided.', async () => {
        // fakeUserService.findByEmail = () => Promise.resolve([
        //     {
        //         id: 1, email: 'test@test.com',
        //         password: 'dbcc6e8df7d30e3d.46e46c90885b1b0034fd3065144d4c60d6dc531cd66290ec4842011ccf7ffb8c'
        //     } as User
        // ]);
        await service.singup('test@test.com', 'pwd');
        const user = service.singin('test@test.com', 'pwd');
        expect(user).toBeDefined();
    })
})