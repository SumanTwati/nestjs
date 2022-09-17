import { Body, Controller, Post, Get, Patch, Delete, Param, Query, NotFoundException, Session, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(
        private userService: UsersService,
        private authService: AuthService) { }

    // @Get('/who-am-i')
    // whoAmI(@Session() session: any) {
    //     const user = this.userService.findOne(session.userId);
    //     if (!user) {
    //         return new BadRequestException('User already signout.');
    //     }
    //     return user;
    // }

    @Get('/who-am-i')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
        return user;
    }

    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.singup(body.email, body.password);
        session.userId = user.id;
        return user;
    }

    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.singin(body.email, body.password);
        session.userId = user.id;
        return user;
    }

    @Post('/singout')
    signOut(@Session() session: any) {
        session.userId = null;
    }

    //@UseInterceptors(new  SerializeInterceptor(UserDto))
    @Get('/:id')
    async findUser(@Param('id') id: string) {
        const user = await this.userService.findOne(parseInt(id));
        if (!user)
            throw new NotFoundException('User not found');
        return user;
    }

    @Get(':email')
    findAllUsersByEmail(@Query('email') email: string) {
        const user = this.userService.findByEmail(email);
        if (!user)
            throw new NotFoundException('User not found');
        return user;
    }

    @Get()
    findAllUsers() {
        return this.userService.findAll();
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.userService.update(parseInt(id), body);
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.userService.remove(parseInt(id));
    }
}
