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
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('api/peliculas')
export class PeliculasController {
    constructor(
        private peliculasService: PeliculasService
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Obtener todas las películas',
        description: 'Obtiene una lista paginada de películas con opciones de ordenamiento'
    })
    @ApiQuery({
        name: 'page',
        required: true,
        type: Number,
        description: 'Número de página (comienza en 0)',
        example: 0
    })
    @ApiQuery({
        name: 'alphabetic',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden alfabético (ascendente o descendente)'
    })
    @ApiQuery({
        name: 'rating',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden por calificación (ascendente o descendente)'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de películas obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'El Padrino',
                    sinopsis: 'La historia de la familia Corleone...',
                    genero: 'Drama',
                    fechaEstreno: '1972-03-24T00:00:00.000Z',
                    duracion: 175,
                    calificacion: 9.2,
                    urlImagen: '/uploads/peliculas/123456789.jpg'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron peliculas',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron peliculas',
                error: 'Not Found'
            }
        }
    })
    findAll(
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',
    ) {
        return this.peliculasService.findAll(+page, alphabetic, rating);
    }


    @Get('generos/:genero')
    @ApiOperation({
        summary: 'Obtener películas por género',
        description: 'Obtiene una lista paginada de películas filtradas por género'
    })
    @ApiParam({
        name: 'genero',
        description: 'Nombre del género a filtrar',
        example: 'Drama'
    })
    @ApiQuery({
        name: 'page',
        required: true,
        type: Number,
        description: 'Número de página (comienza en 0)',
        example: 0
    })
    @ApiQuery({
        name: 'alphabetic',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden alfabético (ascendente o descendente)'
    })
    @ApiQuery({
        name: 'rating',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden por calificación (ascendente o descendente)'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de películas por género obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'El Padrino',
                    genero: 'Drama',
                    calificacion: 9.2
                }
            ]
        }
    })
    @ApiBadRequestResponse({
        description: 'El género no puede estar vacío',
        schema: {
            example: {
                statusCode: 400,
                message: 'El género no puede estar vacío',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron películas con el género especificado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron películas con el género especificado',
                error: 'Not Found'
            }
        }
    })
    findByGenero(@Param('genero') genero: string,
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',
    ) {
        return this.peliculasService.findByGenero(genero, +page, alphabetic, rating);
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Obtener una película por ID',
        description: 'Obtiene los detalles completos de una película específica'
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la película',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Película encontrada exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'El Padrino',
                sinopsis: 'La historia de la familia Corleone...',
                genero: 'Drama',
                fechaEstreno: '1972-03-24T00:00:00.000Z',
                duracion: 175,
                calificacion: 9.2,
                urlImagen: '/uploads/peliculas/123456789.jpg'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontró la película con el ID especificado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontró la película con el ID especificado',
                error: 'Not Found'
            }
        }
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.peliculasService.findOne(id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role('admin')
    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear una nueva película',
        description: 'Crea una nueva película (requiere rol de admin)'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos de la película y su imagen',
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string', example: 'El Padrino' },
                sinopsis: { type: 'string', example: 'La historia de la familia Corleone...' },
                genero: { type: 'string', example: 'Drama' },
                fechaEstreno: { type: 'string', example: '1972-03-24' },
                duracion: { type: 'number', example: 175 },
                calificacion: { type: 'number', example: 9.2 },
                imagen: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagen de la película (opcional)'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Película creada exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'El Padrino',
                sinopsis: 'La historia de la familia Corleone...',
                genero: 'Drama',
                fechaEstreno: '1972-03-24T00:00:00.000Z',
                duracion: 175,
                calificacion: 9.2,
                urlImagen: '/uploads/peliculas/123456789.jpg'
            }
        }
    })
    @ApiConflictResponse({
        description: 'Ya existe una película con ese nombre',
        schema: {
            example: {
                statusCode: 409,
                message: 'Ya existe una película con ese nombre',
                error: 'Conflict'
            }
        }
    })
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


    @Get('search/name')
    @ApiOperation({
        summary: 'Buscar hasta 10 películas por nombre',
        description: 'Busca hasta 10 películas que coincidan con el término de búsqueda'
    })
    @ApiQuery({
        name: 'q',
        description: 'Término de búsqueda',
        required: true,
        example: 'padrino'
    })
    @ApiResponse({
        status: 200,
        description: 'Películas encontradas',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'El Padrino',
                    genero: 'Drama',
                    calificacion: 9.2
                },
                {
                    id: 2,
                    nombre: 'El Padrino: Parte II',
                    genero: 'Drama',
                    calificacion: 9.0
                }
            ]
        }
    })
    @ApiBadRequestResponse({
        description: 'Debe proporcionar un término de búsqueda',
        schema: {
            example: {
                statusCode: 400,
                message: 'Debe proporcionar un término de búsqueda',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron películas',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron películas',
                error: 'Not Found'
            }
        }
    })
    search(@Query('q') query: string) {
        if (!query || query.trim() === '') {
            throw new BadRequestException('Debe proporcionar un término de búsqueda');
        }
        return this.peliculasService.findByKey(query);
    }

    @Get('search/name/genero')
    @ApiOperation({
        summary: 'Buscar películas por nombre dentro de un genero',
        description: 'Busca películas que coincidan con el término de búsqueda dentro de un genero'
    })
    @ApiQuery({
        name: 'q',
        description: 'Término de búsqueda',
        required: true,
    })
    @ApiQuery({
        name: 'page',
        required: true,
        type: Number,
        description: 'Número de página (comienza en 0)',
        example: 0
    })
    @ApiQuery({
        name: 'alphabetic',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden alfabético (ascendente o descendente)'
    })
    @ApiQuery({
        name: 'rating',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Orden por calificación (ascendente o descendente)'
    })
    @ApiBadRequestResponse({
        description: 'Debe proporcionar un término de búsqueda',
        schema: {
            example: {
                statusCode: 400,
                message: 'Debe proporcionar un término de búsqueda',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron películas',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron películas',
                error: 'Not Found'
            }
        }
    })
    searchByGeneroByKey(@Param('genero') genero: string,
        @Query('q') query: string,
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',
    ) {
        if (!query || query.trim() === '') {
            throw new BadRequestException('Debe proporcionar un término de búsqueda');
        }
        return this.peliculasService.findByGeneroByKey(genero, query, page, alphabetic, rating);
    }


    @Get('search/name/all')
    @ApiOperation({
        summary: 'Buscar películas por nombre',
        description: 'Busca películas que coincidan con el término de búsqueda'
    })
    @ApiQuery({
        name: 'q',
        description: 'Término de búsqueda',
        required: true,
        example: 'padrino'
    })
    @ApiResponse({
        status: 200,
        description: 'Películas encontradas',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'El Padrino',
                    genero: 'Drama',
                    calificacion: 9.2
                },
                {
                    id: 2,
                    nombre: 'El Padrino: Parte II',
                    genero: 'Drama',
                    calificacion: 9.0
                }
            ]
        }
    })
    @ApiBadRequestResponse({
        description: 'Debe proporcionar un término de búsqueda',
        schema: {
            example: {
                statusCode: 400,
                message: 'Debe proporcionar un término de búsqueda',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron películas',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron películas',
                error: 'Not Found'
            }
        }
    })
    searchAll(@Query('q') query: string,
        @Query('page', new PagePipe()) page = 0,
        @Query('alphabetic') alphabetic?: 'asc' | 'desc',
        @Query('rating') rating?: 'asc' | 'desc',) {
        if (!query || query.trim() === '') {
            throw new BadRequestException('Debe proporcionar un término de búsqueda');
        }
        return this.peliculasService.findAllByKey(query, page, alphabetic, rating);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role('admin')
    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar una película',
        description: 'Actualiza los datos de una película existente (requiere rol de admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la película a actualizar',
        type: Number,
        example: 1
    })
    @ApiBody({
        description: 'Campos a actualizar',
        schema: {
            type: 'object',
            properties: {
                nombre: {
                    type: 'string',
                    example: 'Nuevo nombre de la pelicula'
                },
                descripcion: {
                    type: 'string',
                    example: 'Nueva sinopsis de la pelicula'
                },
                genero: {
                    type: 'string',
                    example: 'Nuevo genero de la pelicula'
                },
                fechaEstreno: {
                    type: 'Date',
                    example: '1972-03-24T00:00:00.000Z'
                },
                duracion: {
                    type: 'number',
                    example: '180'
                },
                calificacion: {
                    type: 'number',
                    example: '9'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Película actualizada exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'El Padrino: Edición Especial',
                sinopsis: 'Nueva versión remasterizada...',
                genero: 'Drama',
                fechaEstreno: '1972-03-24T00:00:00.000Z',
                duracion: 180,
                calificacion: 9.5,
                urlImagen: '/uploads/peliculas/987654321.jpg'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontró la película con el ID especificado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontró la película con el ID especificado',
                error: 'Not Found'
            }
        }
    })
    update(@Param('id') id: number, @Body() body: UpdatePeliculaDto) {
        return this.peliculasService.update(id, body);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Role('admin')
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Eliminar una película',
        description: 'Elimina una película existente (requiere rol de admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la película a eliminar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Película eliminada exitosamente',
        schema: {
            example: {
                success: true,
                message: 'Película eliminada correctamente.'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontró la película con el ID especificado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontró la película con el ID especificado',
                error: 'Not Found'
            }
        }
    })
    delete(@Param('id') id: number) {
        return this.peliculasService.delete(id);
    }
}