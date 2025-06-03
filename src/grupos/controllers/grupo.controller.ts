import { Controller, Post, Body, Param, ParseIntPipe, Req, UseGuards, Get, Request, } from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGrupoDto } from '../dto/create-grupo.dto';

/**
 * Controlador encargado de manejar las requests relativas a los grupos
 */
@Controller('api/grupos')
@UseGuards(JwtAuthGuard)
export class GrupoController {

  /**
   * Inyecta el servicio de grupos
   * @param grupoService Servicio que contiene la logica de negocio de Grupos
   */
  constructor(private readonly grupoService: GrupoService) { }

  /**
   * Crea un grupo
   * @param dto el DTO definido para la creacion de una review
   * @param req El objeto de la request de HTTP
   * @returns El nuevo grupo
   */
  @Post()
  createGroup(@Body() dto: CreateGrupoDto, @Request() req) {
    const userId = req.user['id'];
    return this.grupoService.create(dto.nombre, userId, dto.descripcion);
  }

  /**
   * Une a un usuario a un grupo 
   * @param grupoId ID del grupo al cual el usuario se va a unir
   * @param req El objeto de la request de HTTP
   * @returns Confirmacion de si el usuario se pudo unir al grupo correctamente
   */
  @Post(':id')
  joinGroup(@Param('id', ParseIntPipe) grupoId: number, @Request() req) {
    const userId = req.user['id'];
    return this.grupoService.join(grupoId, userId);
  }

  /**
   * Devuelve todos los grupos
   * @returns 
   */
  @Get()
  getGroups() {
    return this.grupoService.getAll();
  }

  /**
   * Devuelve el grupo con el id especificado
   * @param grupoId Id del grupo a buscar
   * @returns Grupo con el id especificado
   */
  @Get(':id')
  getGroupById(@Param('id', ParseIntPipe) grupoId: number) {
    return this.grupoService.getOneById(grupoId);
  }

  /**
   * Obtiene a los usuarios de un grupo en especifico
   * @param grupoId ID del grupo del cual buscar los usuarios
   * @returns Usuarios Obtenidos
   */
  @Get(':id/members')
  getMembersByGroup(@Param('id', ParseIntPipe) grupoId: number) {
    return this.grupoService.getMembers(grupoId);
  }

  @Get(':id/count-members')
  async countMembers(@Param('id', ParseIntPipe) id: number) {
    return { cantidad: await this.grupoService.countMembers(id) };
  }
}
