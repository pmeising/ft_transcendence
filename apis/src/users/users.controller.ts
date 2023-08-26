import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Secret2faDTO } from './dto/secret-2fa.dto';

@Controller('pong/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth')
  @HttpCode(200)
  authenticate(@Body() authUserDto: AuthUserDto) {
    return this.usersService.authenticate(authUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('auth/2fa/:id')
  generateSecret(@Param('id') id: string) {
    return this.usersService.generateSecret(id);
  }

  @Post('auth/2fa')
  @HttpCode(200)
  validateSecret(@Body() secret: Secret2faDTO) {
    return this.usersService.verify(secret);
  }
}
