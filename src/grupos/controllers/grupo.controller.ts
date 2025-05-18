import {Controller, Post, Body, Param, ParseIntPipe, Req, UseGuards, Get, Request, } from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGrupoDto } from '../dto/create-grupo.dto';

@Controller('api/grupos')
@UseGuards(JwtAuthGuard)
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post('create')
  createGroup(@Body() dto: CreateGrupoDto, @Request() req) {
    const userId = req.user['id'];
    return this.grupoService.create(dto.nombre, userId, dto.descripcion);
  }

  @Post(':id/join')
  joinGroup(@Param('id', ParseIntPipe) grupoId: number, @Request() req) {
    const userId = req.user['id'];
    return this.grupoService.join(grupoId, userId);
  }

  @Get()
  getGroups() {
    return this.grupoService.getAll();
  }

  @Get(':id/members')
  getMembersByGroup(@Param('id', ParseIntPipe) grupoId: number) {
    return this.grupoService.getMembers(grupoId);
  }
}
