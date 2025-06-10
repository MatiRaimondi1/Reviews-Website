import { Controller, Post, Body, Param, ParseIntPipe, Req, UseGuards, Get, Request, Delete, Query, BadRequestException, Patch, } from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGrupoDto } from '../dto/create-grupo.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('api/grupos')
export class GrupoController {
    constructor(
        private readonly grupoService: GrupoService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({
        summary: 'Crear un nuevo grupo',
        description: 'Crea un nuevo grupo. El usuario creador se convierte automáticamente en líder.'
    })
    @ApiBearerAuth()
    @ApiBody({ type: CreateGrupoDto })
    @ApiResponse({
        status: 201,
        description: 'Grupo creado exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'Grupo de Cine',
                descripcion: 'Amantes del cine clásico',
                createdAt: '2023-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiConflictResponse({
        description: 'El usuario ya pertenece a un grupo o el nombre del grupo ya existe',
        schema: {
            examples: {
                userInGroup: {
                    value: {
                        statusCode: 409,
                        message: 'No puedes estar en más de un grupo',
                        error: 'Conflict'
                    }
                },
                groupExists: {
                    value: {
                        statusCode: 409,
                        message: 'Ya existe un grupo con ese nombre',
                        error: 'Conflict'
                    }
                }
            }
        }
    })
    createGroup(@Body() dto: CreateGrupoDto, @Request() req) {
        const userId = req.user['id'];
        return this.grupoService.create(dto.nombre, userId, dto.descripcion);
    }


    @UseGuards(JwtAuthGuard)
    @Patch(':grupoId')
    @ApiOperation({
        summary: 'Actualizar grupo',
        description: 'Actualiza la información de un grupo existente (solo líder o admin)'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'grupoId',
        description: 'ID del grupo a actualizar',
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
                    example: 'Nuevo nombre del grupo'
                },
                descripcion: {
                    type: 'string',
                    example: 'Nueva descripción del grupo'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Grupo actualizado exitosamente',
        schema: {
            example: {
                mensaje: 'Grupo actualizado correctamente',
                grupo: {
                    id: 1,
                    nombre: 'Nuevo nombre del grupo',
                    descripcion: 'Nueva descripción del grupo'
                }
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'Grupo no encontrado',
                error: 'Not Found'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para editar este grupo',
        schema: {
            example: {
                statusCode: 403,
                message: 'No tienes permiso para editar este grupo',
                error: 'Forbidden'
            }
        }
    })
    async update(@Param('grupoId', ParseIntPipe) grupoId: number, @Request() req, @Body() cambios: { nombre?: string; descripcion?: string }) {
        const userId = req.user.id;
        return this.grupoService.update(grupoId, userId, cambios);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':grupoId/kick/:userId')
    @ApiOperation({
        summary: 'Expulsar usuario del grupo',
        description: 'Expulsa a un usuario del grupo (solo líder o admin)'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'grupoId',
        description: 'ID del grupo',
        type: Number,
        example: 1
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario a expulsar',
        type: Number,
        example: 2
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario expulsado exitosamente',
        schema: {
            example: {
                mensaje: 'Usuario expulsado correctamente del grupo'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado o usuario no pertenece al grupo',
        schema: {
            examples: {
                groupNotFound: {
                    value: {
                        statusCode: 404,
                        message: 'Grupo no encontrado',
                        error: 'Not Found'
                    }
                },
                userNotInGroup: {
                    value: {
                        statusCode: 404,
                        message: 'El usuario a expulsar no pertenece al grupo',
                        error: 'Not Found'
                    }
                }
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para expulsar usuarios',
        schema: {
            example: {
                statusCode: 403,
                message: 'No tienes permiso para expulsar usuarios',
                error: 'Forbidden'
            }
        }
    })
    async kick(@Param('grupoId', ParseIntPipe) grupoId: number, @Param('userId', ParseIntPipe) userIdExpulsar: number, @Request() req,) {
        const userIdSolicitante = req.user.id;
        return this.grupoService.kickUser(grupoId, userIdExpulsar, userIdSolicitante);
    }


    @UseGuards(JwtAuthGuard)
    @Post(':id')
    @ApiOperation({
        summary: 'Unirse a un grupo',
        description: 'Une al usuario autenticado a un grupo existente'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        description: 'ID del grupo al que unirse',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario unido al grupo exitosamente',
        schema: {
            example: {
                mensaje: 'Te uniste al grupo correctamente'
            }
        }
    })
    @ApiConflictResponse({
        description: 'El usuario ya pertenece a un grupo',
        schema: {
            example: {
                statusCode: 409,
                message: 'No puedes estar en más de un grupo',
                error: 'Conflict'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontró un grupo con ese id',
                error: 'Not Found'
            }
        }
    })
    joinGroup(@Param('id', ParseIntPipe) grupoId: number, @Request() req) {
        const userId = req.user['id'];
        return this.grupoService.join(grupoId, userId);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id/leave')
    @ApiOperation({
        summary: 'Abandonar grupo',
        description: 'El usuario autenticado abandona el grupo especificado'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        description: 'ID del grupo a abandonar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario abandonó el grupo exitosamente',
        schema: {
            examples: {
                normalLeave: {
                    value: {
                        mensaje: 'Saliste del grupo correctamente'
                    }
                },
                groupDeleted: {
                    value: {
                        mensaje: 'Saliste del grupo. El grupo fue eliminado porque no tenía más miembros'
                    }
                }
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'El usuario no pertenece al grupo o el grupo no existe',
        schema: {
            example: {
                statusCode: 404,
                message: 'No estás en este grupo o el grupo no existe',
                error: 'Not Found'
            }
        }
    })
    async leaveGroup(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.id;
        return this.grupoService.leave(id, userId);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar grupo',
        description: 'Elimina un grupo existente (solo líder o admin)'
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'id',
        description: 'ID del grupo a eliminar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Grupo eliminado exitosamente',
        schema: {
            example: {
                mensaje: 'Grupo eliminado correctamente'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'Grupo no encontrado',
                error: 'Not Found'
            }
        }
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para eliminar este grupo',
        schema: {
            example: {
                statusCode: 403,
                message: 'Solo el líder o un administrador puede eliminar el grupo',
                error: 'Forbidden'
            }
        }
    })
    async deleteGroup(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.id;
        return this.grupoService.delete(id, userId);
    }


    @Get()
    @ApiOperation({
        summary: 'Obtener todos los grupos',
        description: 'Devuelve una lista de todos los grupos registrados'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de grupos obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'Grupo de Cine',
                    descripcion: 'Amantes del cine clásico',
                    createdAt: '2023-01-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    nombre: 'Grupo de Series',
                    descripcion: 'Fans de las series de TV',
                    createdAt: '2023-01-02T00:00:00.000Z'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'No hay grupos registrados',
        schema: {
            example: {
                statusCode: 404,
                message: 'No hay grupos registrados',
                error: 'Not Found'
            }
        }
    })
    getGroups() {
        return this.grupoService.getAll();
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Obtener grupo por ID',
        description: 'Devuelve los detalles de un grupo específico'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del grupo a buscar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Grupo encontrado exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'Grupo de Cine',
                descripcion: 'Amantes del cine clásico',
                createdAt: '2023-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'El grupo no existe',
                error: 'Not Found'
            }
        }
    })
    getGroupById(@Param('id', ParseIntPipe) grupoId: number) {
        return this.grupoService.getOneById(grupoId);
    }


    @Get('search/name')
    @ApiOperation({
        summary: 'Buscar grupos por nombre',
        description: 'Busca grupos cuyo nombre coincida con el término de búsqueda'
    })
    @ApiQuery({
        name: 'q',
        description: 'Término de búsqueda',
        required: true,
        example: 'cine'
    })
    @ApiResponse({
        status: 200,
        description: 'Grupos encontrados exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'Grupo de Cine',
                    descripcion: 'Amantes del cine clásico'
                },
                {
                    id: 3,
                    nombre: 'Cinefilia Moderna',
                    descripcion: 'Discusión sobre cine contemporáneo'
                }
            ]
        }
    })
    @ApiBadRequestResponse({
        description: 'No se proporcionó término de búsqueda',
        schema: {
            example: {
                statusCode: 400,
                message: 'Debe proporcionar un término de búsqueda',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron grupos con ese nombre',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron grupos con ese nombre',
                error: 'Not Found'
            }
        }
    })
    search(@Query('q') query: string) {
        if (!query || query.trim() === '') {
            throw new BadRequestException('Debe proporcionar un término de búsqueda');
        }
        return this.grupoService.getByName(query);
    }


    @Get(':id/members')
    @ApiOperation({
        summary: 'Obtener miembros del grupo',
        description: 'Devuelve una lista de todos los miembros de un grupo específico'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del grupo',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de miembros obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'usuario1',
                    urlImagen: '/uploads/user-123456789.jpg',
                    rol: 'lider'
                },
                {
                    id: 2,
                    nombre: 'usuario2',
                    urlImagen: '/uploads/user-987654321.jpg',
                    rol: 'miembro'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'Grupo no encontrado',
                error: 'Not Found'
            }
        }
    })
    getMembersByGroup(@Param('id', ParseIntPipe) grupoId: number) {
        return this.grupoService.getMembers(grupoId);
    }


    @Get(':id/count-members')
    @ApiOperation({
        summary: 'Contar miembros del grupo',
        description: 'Devuelve la cantidad de miembros de un grupo específico'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del grupo',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Cantidad de miembros obtenida exitosamente',
        schema: {
            example: {
                cantidad: 5
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Grupo no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'Grupo no encontrado',
                error: 'Not Found'
            }
        }
    })
    async countMembers(@Param('id', ParseIntPipe) id: number) {
        return { cantidad: await this.grupoService.countMembers(id) };
    }


    @Get(':grupoId/membership/:userId')
    @ApiOperation({
        summary: 'Verificar membresía',
        description: 'Verifica si un usuario específico pertenece a un grupo'
    })
    @ApiParam({
        name: 'grupoId',
        description: 'ID del grupo',
        type: Number,
        example: 1
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Información de membresía obtenida exitosamente',
        schema: {
            examples: {
                isMember: {
                    value: {
                        mensaje: 'El usuario pertenece al grupo',
                        enGrupo: true,
                        rol: 'miembro'
                    }
                },
                notMember: {
                    value: {
                        mensaje: 'El usuario no pertenece al grupo',
                        enGrupo: false,
                        rol: ''
                    }
                }
            }
        }
    })
    async isUserInGroup(@Param('grupoId', ParseIntPipe) grupoId: number, @Param('userId', ParseIntPipe) userId: number) {
        return this.grupoService.isUserInGroup(userId, grupoId);
    }
}