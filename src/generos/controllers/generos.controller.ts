import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GenerosService } from '../services/generos.service';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('api/generos')
export class GenerosController {
    constructor(
        private readonly generosService: GenerosService
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Obtener todos los géneros',
        description: 'Devuelve una lista completa de todos los géneros disponibles en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de géneros obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    nombre: 'Acción'
                },
                {
                    id: 2,
                    nombre: 'Drama'
                },
                {
                    id: 3,
                    nombre: 'Comedia'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron géneros',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron géneros',
                error: 'Not Found'
            }
        }
    })
    async findAll() {
        return this.generosService.findAll();
    }


    @Get('id/:id')
    @ApiOperation({
        summary: 'Buscar género por ID',
        description: 'Obtiene los detalles de un género específico usando su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del género a buscar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Género encontrado exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'Acción'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Género no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontro un genero con ese nombre',
                error: 'Not Found'
            }
        }
    })
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.generosService.findById(id);
    }


    @Get('nombre/:nombre')
    @ApiOperation({
        summary: 'Buscar género por nombre',
        description: 'Obtiene los detalles de un género específico usando su nombre exacto'
    })
    @ApiParam({
        name: 'nombre',
        description: 'Nombre exacto del género a buscar',
        type: String,
        example: 'Acción'
    })
    @ApiResponse({
        status: 200,
        description: 'Género encontrado exitosamente',
        schema: {
            example: {
                id: 1,
                nombre: 'Acción'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Género no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontro un genero con ese nombre',
                error: 'Not Found'
            }
        }
    })
    async findByName(@Param('nombre') nombre: string) {
        return this.generosService.findByName(nombre);
    }
}