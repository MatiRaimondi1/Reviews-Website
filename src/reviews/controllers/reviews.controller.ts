import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ReviewsService } from "../services/reviews.service";
import { CreateReviewDto } from "../dto/create-review.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";

@Controller('api/reviews')
export class ReviewsController {
    constructor(
        private readonly reviewsService: ReviewsService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Post(':peliculaId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crear una nueva review',
        description: 'Crea una nueva review para una película. Puede ser individual o grupal (requiere autenticación)'
    })
    @ApiParam({
        name: 'peliculaId',
        description: 'ID de la película a reseñar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 201,
        description: 'Review creada exitosamente',
        schema: {
            example: {
                id: 1,
                texto: 'Excelente película, muy recomendable',
                puntuacion: 9,
                user: {
                    id: 1,
                    username: 'usuario1'
                },
                pelicula: {
                    id: 1,
                    nombre: 'El Padrino'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado (token inválido o no proporcionado)'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario, película o grupo no encontrado'
    })
    @ApiResponse({
        status: 409,
        description: 'Ya existe una review para esta película por este usuario/grupo'
    })
    create(
        @Param('peliculaId', ParseIntPipe) peliculaId: number,
        @Body() dto: CreateReviewDto,
        @Request() req
    ) {
        const userId = req.user.id;
        const grupoId = dto.grupoId;

        return this.reviewsService.create(dto, userId, peliculaId, grupoId);
    }


    @Get(':peliculaId')
    @ApiOperation({
        summary: 'Obtener reviews de una película',
        description: 'Obtiene todas las reviews de una película específica'
    })
    @ApiParam({
        name: 'peliculaId',
        description: 'ID de la película',
        type: Number,
        example: 1
    })
    @ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Número de página (comienza en 0)',
            example: 0
        })
    @ApiResponse({
        status: 200,
        description: 'Lista de reviews obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    texto: 'Excelente película',
                    puntuacion: 9,
                    user: {
                        id: 1,
                        username: 'usuario1'
                    }
                },
                {
                    id: 2,
                    texto: 'Muy buena',
                    puntuacion: 8,
                    user: {
                        id: 2,
                        username: 'usuario2'
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 404,
        description: 'No se encontraron reviews para esta película'
    })
    findByPelicula(
        @Param('peliculaId', ParseIntPipe) peliculaId: number,
        @Query('page') page = 0,
    ) {
        return this.reviewsService.findByPelicula(peliculaId, page);
    }


    @Get('user/:userId')
    @ApiOperation({
        summary: 'Obtener reviews de un usuario',
        description: 'Obtiene todas las reviews realizadas por un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario',
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (comienza en 0)',
        example: 0
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de reviews del usuario obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    texto: 'Me encantó esta película',
                    puntuacion: 9,
                    pelicula: {
                        id: 1,
                        nombre: 'El Padrino'
                    }
                },
                {
                    id: 2,
                    texto: 'Buena pero no excelente',
                    puntuacion: 7,
                    pelicula: {
                        id: 2,
                        nombre: 'El Padrino: Parte II'
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 404,
        description: 'El usuario no tiene reviews o no existe'
    })
    getReviewsByUsuario(
        @Param('userId', ParseIntPipe) userId: number,
        @Query('page') page = 0,
    ) {
        return this.reviewsService.findByUsuario(userId, page);
    }

    
    @Get('grupo/:grupoId')
    @ApiOperation({
        summary: 'Obtener reviews de un grupo',
        description: 'Obtiene todas las reviews realizadas por un grupo específico'
    })
    @ApiParam({
        name: 'grupoId',
        description: 'ID del grupo',
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (comienza en 0)',
        example: 0
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de reviews del grupo obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    texto: 'Nos encantó esta película',
                    puntuacion: 9,
                    pelicula: {
                        id: 1,
                        nombre: 'El Padrino'
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 404,
        description: 'El grupo no tiene reviews o no existe'
    })
    getReviewsByGrupo(
        @Param('grupoId', ParseIntPipe) grupoId: number,
        @Query('page') page = 0,
    ) {
        return this.reviewsService.findByGrupo(grupoId, page);
    }


    @Get('pelicula/:movieId/count')
    @ApiOperation({
        summary: 'Contar reviews de una pelicula',
        description: 'Obtiene la cantidad de reviews de una pelicula'
    })
    @ApiParam({
        name: 'movieId',
        description: 'ID de la pelicula',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Cantidad de reviews obtenida exitosamente',
        schema: {
            example: {
                cantidad: 5
            }
        }
    })
    async countByMovie(@Param('movieId', ParseIntPipe) movieId: number) {
        return { cantidad: await this.reviewsService.countByMovie(movieId) };
    }


    @Get('user/:userId/count')
    @ApiOperation({
        summary: 'Contar reviews de un usuario',
        description: 'Obtiene la cantidad de reviews realizadas por un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Cantidad de reviews obtenida exitosamente',
        schema: {
            example: {
                cantidad: 5
            }
        }
    })
    async countReviewsByUsuario(@Param('userId', ParseIntPipe) userId: number) {
        return { cantidad: await this.reviewsService.countByUsuario(userId) };
    }

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Editar una review',
        description: 'Edita el texto o puntuación de una review existente (solo el autor o admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la review a editar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Review actualizada exitosamente',
        schema: {
            example: {
                id: 1,
                texto: 'Texto actualizado de la review',
                puntuacion: 8,
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o no eres el autor'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado (token inválido o no proporcionado)'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Review no encontrada'
    })
    async edit(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: { texto?: string; puntuacion?: number },
        @Request() req,
    ) {
        const userId = req.user.id;
        return this.reviewsService.edit(id, userId, updateData);
    }


    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Eliminar una review',
        description: 'Elimina una review existente (solo el autor o admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la review a eliminar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Review eliminada exitosamente',
        schema: {
            example: {
                success: true,
                message: 'Review eliminada correctamente'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'No eres el autor de esta review'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado (token inválido o no proporcionado)'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Review no encontrada'
    })
    delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const user = req.user.id;
        return this.reviewsService.delete(id, user);
    }
}