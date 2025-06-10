import { Body, Request, Controller, Post, UseGuards, Delete, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReunionService } from "../services/reunion.service";
import { CreateReunionDto } from "../dto/create-reunion.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller('api/reuniones')
@UseGuards(JwtAuthGuard)
export class ReunionController {
    constructor(
        private readonly reunionService: ReunionService
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Crear reunión',
        description: 'Crea una nueva reunión para el grupo del usuario (requiere ser líder del grupo)'
    })
    @ApiBody({ 
        type: CreateReunionDto,
        description: 'Datos requeridos para crear la reunión',
        examples: {
            example1: {
                summary: 'Creación básica',
                value: {
                    fecha: '2023-12-15T20:00:00Z',
                    link: 'https://meet.google.com/abc-def-ghi'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Reunión creada exitosamente',
        schema: {
            example: {
                id: 1,
                fecha: '2023-12-15T20:00:00Z',
                link: 'https://meet.google.com/abc-def-ghi',
                grupo: {
                    id: 1,
                    nombre: 'Grupo de Cine'
                }
            }
        }
    })
    @ApiConflictResponse({
        description: 'Ya existe una reunión para este grupo',
        schema: {
            example: {
                statusCode: 409,
                message: 'Ya existe una reunión para este grupo',
                error: 'Conflict'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No eres líder del grupo',
        schema: {
            example: {
                statusCode: 403,
                message: 'Solo el líder del grupo puede realizar esta acción',
                error: 'Forbidden'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Usuario no encontrado',
        schema: {
            example: {
                statusCode: 400,
                message: 'Usuario no encontrado',
                error: 'Bad Request'
            }
        }
    })
    async createReunion(@Body() dto: CreateReunionDto, @Request() req) {
        const userId = req.user['id'];
        return this.reunionService.create(userId, dto);
    }


    @Delete()
    @ApiOperation({
        summary: 'Eliminar reunión',
        description: 'Elimina la reunión del grupo del usuario (requiere ser líder del grupo)'
    })
    @ApiResponse({
        status: 200,
        description: 'Reunión eliminada exitosamente',
        schema: {
            example: {
                message: 'Reunión eliminada correctamente'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No hay reunión para eliminar',
        schema: {
            example: {
                statusCode: 400,
                message: 'No se encontraron reuniones para eliminar',
                error: 'Bad Request'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No eres líder del grupo',
        schema: {
            example: {
                statusCode: 403,
                message: 'Solo el líder del grupo puede realizar esta acción',
                error: 'Forbidden'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Usuario no encontrado',
        schema: {
            example: {
                statusCode: 400,
                message: 'Usuario no encontrado',
                error: 'Bad Request'
            }
        }
    })
    async deleteReunion(@Request() req) {
        const userId = req.user['id'];
        return this.reunionService.delete(userId)
    }


    @Get()
    @ApiOperation({
        summary: 'Obtener reunión',
        description: 'Obtiene la reunión vigente del grupo del usuario'
    })
    @ApiResponse({
        status: 200,
        description: 'Reunión obtenida exitosamente',
        schema: {
            example: {
                id: 1,
                fecha: '2023-12-15T20:00:00Z',
                link: 'https://meet.google.com/abc-def-ghi',
                grupo: {
                    id: 1,
                    nombre: 'Grupo de Cine'
                }
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No hay reunión para el grupo',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontró reunión para tu grupo',
                error: 'Not Found'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No perteneces a ningún grupo',
        schema: {
            example: {
                statusCode: 403,
                message: 'No perteneces a ningún grupo',
                error: 'Forbidden'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Usuario no encontrado',
        schema: {
            example: {
                statusCode: 400,
                message: 'Usuario no encontrado',
                error: 'Bad Request'
            }
        }
    })
    async getReunion(@Request() req) {
        const userId = req.user['id'];
        return this.reunionService.getReunion(userId);
    }
}