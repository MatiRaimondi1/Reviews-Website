import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { PeliculasService } from '../services/peliculas.service';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/decorators/role.decorator';

@Controller('api/peliculas')
export class PeliculasController {

    constructor(
        private peliculasService: PeliculasService
    ) {}
    
    @Get()
    findAll(@Query('page') page = 0) {
        return this.peliculasService.findAll(+page);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.peliculasService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Post()
    create(@Body() body: CreatePeliculaDto) {
        return this.peliculasService.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Put(':id')
    update(@Param('id') id: number, @Body() body: UpdatePeliculaDto) {
        return this.peliculasService.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.peliculasService.delete(id);
    }

}
