import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { ComentariosService } from "../services/comentarios.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('user', 'admin')
@Controller('api/comentarios')
export class ComentariosController {
    constructor(
        private readonly comentariosService: ComentariosService
    ) { }

    @Post(':reviewId')
    @ApiOperation({
        summary: 'Crear un comentario',
        description: 'Crea un nuevo comentario en una review específica (requiere autenticación)'
    })
    @ApiParam({
        name: 'reviewId',
        description: 'ID de la review donde se publicará el comentario',
        type: Number,
        example: 1
    })
    @ApiBody({
        type: CreateComentarioDto,
        description: 'Contenido del comentario',
        examples: {
            ejemplo1: {
                summary: 'Comentario normal',
                value: {
                    texto: 'Estoy totalmente de acuerdo con tu review!'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Comentario creado exitosamente',
        schema: {
            example: {
                id: 1,
                texto: 'Estoy totalmente de acuerdo con tu review!',
                user: {
                    id: 1,
                    username: 'usuario1'
                },
                review: {
                    id: 1
                }
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Review o usuario no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'Review o usuario no encontrado',
                error: 'Not Found'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No autorizado',
        schema: {
            example: {
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden'
            }
        }
    })
    create(@Param('reviewId') reviewId: number, @Body() dto: CreateComentarioDto, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.create(reviewId, userId, dto);
    }


    @Get(':reviewId')
    @ApiOperation({
        summary: 'Obtener comentarios de una review',
        description: 'Lista todos los comentarios asociados a una review específica'
    })
    @ApiParam({
        name: 'reviewId',
        description: 'ID de la review para obtener sus comentarios',
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
        description: 'Lista de comentarios obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    texto: 'Excelente review, comparto tu opinión',
                    user: {
                        id: 1,
                        username: 'usuario1'
                    }
                },
                {
                    id: 2,
                    texto: 'No estoy del todo de acuerdo, pero buen análisis',
                    user: {
                        id: 2,
                        username: 'usuario2'
                    }
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'Review no encontrada o sin comentarios',
        schema: {
            examples: {
                reviewNotFound: {
                    value: {
                        statusCode: 404,
                        message: 'No se encontro una review con este id',
                        error: 'Not Found'
                    }
                },
                noComments: {
                    value: {
                        statusCode: 404,
                        message: 'No se encontraron comentarios para esta review',
                        error: 'Not Found'
                    }
                }
            }
        }
    })
    async findByReview(
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Query('page') page = 0,
    ) {
        return this.comentariosService.findByReview(reviewId, page);
    }


    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar un comentario',
        description: 'Elimina un comentario específico (solo el autor o admin)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del comentario a eliminar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Comentario eliminado exitosamente',
        schema: {
            example: {
                success: true,
                message: 'Comentario eliminado correctamente.'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Comentario o usuario no encontrado',
        schema: {
            examples: {
                commentNotFound: {
                    value: {
                        statusCode: 404,
                        message: 'Comentario no encontrado',
                        error: 'Not Found'
                    }
                },
                userNotFound: {
                    value: {
                        statusCode: 404,
                        message: 'Usuario no encontrado',
                        error: 'Not Found'
                    }
                }
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para eliminar este comentario',
        schema: {
            example: {
                statusCode: 403,
                message: 'No tienes permiso para eliminar este comentario',
                error: 'Forbidden'
            }
        }
    })
    remove(@Param('id') id: number, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.remove(id, userId);
    }
}