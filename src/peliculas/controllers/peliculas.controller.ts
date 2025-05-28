import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PeliculasService } from '../services/peliculas.service';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

/**
 * Controlador que maneja las rutas relacionadas con películas.
 */
@Controller('api/peliculas')
export class PeliculasController {

    /**
     * Inyecta el servicio de películas.
     * @param peliculasService Servicio que contiene la lógica de negocio de películas.
     */
    constructor(
        private peliculasService: PeliculasService
    ) { }

    /**
     * Obtiene una lista paginada de películas.
     * 
     * @param page Número de página (opcional). Por defecto, 0.
     * @returns Lista de películas.
     */
    @Get()
    findAll(@Query('page') page = 0) {
        return this.peliculasService.findAll(+page);
    }

    /**
     * Obtiene una lista paginada de peliculas por genero.
     * 
     * @param genero Nombre del genero de la pelicula.
     * @param page Número de página (opcional). Por defecto, es 0.
     * @returns Lista de peliculas por genero.
     */
    @Get('generos/:genero')
    findByGenero(@Param('genero') genero: string, @Query('page') page = 0) {
        return this.peliculasService.findByGenero(genero, +page);
    }

    /**
    * Obtiene una película por su ID.
    * 
    * @param id ID de la película.
    * @returns Película encontrada.
    */
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.peliculasService.findOne(id);
    }

    /**
     * Crea una nueva película.
     * Solo accesible por usuarios con rol "admin".
     * 
     * @param body Datos para crear la película.
     * @returns Película creada.
     */
    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Post()
    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
                cb(null, uniqueName);
            },
        }),
    }))
    create(@Body() dto: CreatePeliculaDto, @UploadedFile() imagen: Express.Multer.File) {
        const urlImagen = imagen ? `/uploads/peliculas/${imagen.filename}` : null;
        return this.peliculasService.create(dto, urlImagen);
    }

    /**
     * Actualiza una película existente.
     * Solo accesible por usuarios con rol "admin".
     * 
     * @param id ID de la película a actualizar.
     * @param body Datos nuevos de la película.
     * @returns Película actualizada.
     */
    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Put(':id')
    update(@Param('id') id: number, @Body() body: UpdatePeliculaDto) {
        return this.peliculasService.update(id, body);
    }

    /**
     * Elimina una película por su ID.
     * Solo accesible por usuarios con rol "admin".
     * 
     * @param id ID de la película a eliminar.
     * @returns `true` si la operación fue exitosa.
     */
    @UseGuards(JwtAuthGuard)
    @Role('admin')
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.peliculasService.delete(id);
    }
}
