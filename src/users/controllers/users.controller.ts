import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

/**
 * Controlador encargado de manejar las requests relativas a los usuarios
 */

@Controller('api/users')
export class UsersController {

  /**
   * Inyecta el servicio de Users
   * @param usersService Servicio que contiene la logica de negocio de Users
   */
  constructor(private readonly usersService: UsersService) {}
  
  /**
   * Crea un nuevo usuario
   * 
   * @param createUserDto el DTO definido para la creacion de un usuario
   * @returns El nuevo usuario
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Devuelve todos los usuarios
   * 
   * @returns 
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Devuelve el usuario con el ID especificado
   * 
   * @param id ID del usuario a buscar
   * @returns 
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
