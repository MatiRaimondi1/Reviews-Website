import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { PeliculasService } from '../services/peliculas.service';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';

@Controller('api/peliculas')
export class PeliculasController {

    constructor(
        private peliculasService: PeliculasService
    ) {}
    
    @Get()
    findAll() {
        return this.peliculasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.peliculasService.findOne(id);
    }

    @Post()
    create(@Body() body: CreatePeliculaDto) {
        return this.peliculasService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() body: UpdatePeliculaDto) {
        return this.peliculasService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.peliculasService.delete(id);
    }

}
