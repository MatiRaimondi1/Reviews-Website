import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GenerosService } from '../services/generos.service';

@Controller('api/generos')
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Get()
  async findAll() {
    return this.generosService.findAll();
  }

  @Get('id/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.generosService.findById(id);
  }

  @Get('nombre/:nombre')
  async findByName(@Param('nombre') nombre: string) {
    return this.generosService.findByName(nombre);
  }
}