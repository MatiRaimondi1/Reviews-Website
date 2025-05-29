import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/decorators/role.decorator';

/**
 * Controlador encargado de manejar las requests relativas a los usuarios
 */

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {

  /**
   * Inyecta el servicio de Users
   * @param usersService Servicio que contiene la logica de negocio de Users
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Devuelve todos los usuarios
   * 
   * @returns 
   */
  @Role('admin')
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
  @Role('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
