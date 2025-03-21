import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() body: { name: string; email: string; role: string }) {
    return this.usersService.create(body.name, body.email, body.role);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name: string; email: string; role: string }) {
    return this.usersService.update(+id, body.name, body.email, body.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
