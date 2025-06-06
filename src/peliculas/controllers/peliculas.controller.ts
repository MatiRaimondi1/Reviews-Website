import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { PeliculasService } from '../services/peliculas.service';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PagePipe } from '../pipes/page.pipe';

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
     * @param alphabetic Ordenamiento alfabetico ascendente o descendente (Opcional)
     * @param rating Ordenamiento por calificacion ascendente o descendente (Opcional)
     * @returns Lista de películas.
     */
    @Get()
    findAll(
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',
    ) {
        return this.peliculasService.findAll(+page, alphabetic, rating);
    }

    /**
     * Obtiene una lista paginada de peliculas por genero.
     * 
     * @param genero Nombre del genero de la pelicula.
     * @param page Número de página (opcional). Por defecto, es 0.
     * @param alphabetic Ordenamiento alfabetico ascendente o descendente (Opcional)
     * @param rating Ordenamiento por calificacion ascendente o descendente (Opcional)
     * @returns Lista de peliculas por genero.
     */
    @Get('generos/:genero')
    findByGenero(@Param('genero') genero: string, 
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',
    ) {
        return this.peliculasService.findByGenero(genero, +page, alphabetic, rating);
    }

    /**
    * Obtiene una película por su ID.
    * 
    * @param id ID de la película.
    * @returns Película encontrada.
    */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.peliculasService.findOne(id);
    }

    /**
     * Crea una nueva película.
     * Solo accesible por usuarios con rol "admin".
     * 
     * @param dto Datos para crear la película.
     * @param imagen Archivo con formato de imagen (Opcional).
     * @returns Película creada.
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
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
     * Busca todas las peliculas que coincidan con un cierto termino de busqueda
     * 
     * @param query Nombre parcial de la/s pelicula/s a buscar
     * @returns Todas las peliculas que coincidan
     */
    @Get('search/name')
    buscar(@Query('q') query: string) {
        if (!query || query.trim() === '') {
            throw new BadRequestException('Debe proporcionar un término de búsqueda');
        }
        return this.peliculasService.findByKey(query);
    }

    /**
     * Actualiza una película existente.
     * Solo accesible por usuarios con rol "admin".
     * 
     * @param id ID de la película a actualizar.
     * @param body Datos nuevos de la película.
     * @returns Película actualizada.
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
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
     * @returns resultado de la operación.
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role('admin')
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.peliculasService.delete(id);
    }
}
