import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GenerosService } from '../services/generos.service';

/**
 * Controlador encargado de manejar las requests relativas a los generos
 */
@Controller('api/generos')
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  /**
   * Devuelve todos los generos
   * @returns 
   */
  @Get()
  async findAll() {
    return this.generosService.findAll();
  }

  /**
   * Devuelve un genero dado un ID
   * @param id ID del genero
   * @returns 
   */
  @Get('id/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.generosService.findById(id);
  }

  /**
   * Devuelve un genero dado un nombre
   * @param nombre Nombre del genero
   * @returns 
   */
  @Get('nombre/:nombre')
  async findByName(@Param('nombre') nombre: string) {
    return this.generosService.findByName(nombre);
  }
}