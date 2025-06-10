import { BadRequestException, Controller, Get, Param, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Obtener todos los usuarios',
        description: 'Devuelve una lista completa de todos los usuarios registrados en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
        schema: {
            example: [
                {
                    id: 1,
                    username: 'usuario1',
                    email: 'usuario1@example.com',
                    rol: 'user',
                    urlImagen: '/uploads/user-123456789.jpg'
                },
                {
                    id: 2,
                    username: 'usuario2',
                    email: 'usuario2@example.com',
                    rol: 'admin',
                    urlImagen: '/uploads/user-987654321.jpg'
                }
            ]
        }
    })
    @ApiNotFoundResponse({
        description: 'No se encontraron usuarios',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontraron usuarios',
                error: 'Not Found'
            }
        }
    })
    findAll() {
        return this.usersService.findAll();
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Obtener usuario por ID',
        description: 'Devuelve los detalles de un usuario específico usando su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del usuario a buscar',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario encontrado exitosamente',
        schema: {
            example: {
                id: 1,
                username: 'usuario1',
                email: 'usuario1@example.com',
                rol: 'user',
                urlImagen: '/uploads/user-123456789.jpg'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'No se encontro un usuario con ese ID',
                error: 'Not Found'
            }
        }
    })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('profile-image')
    @ApiOperation({
        summary: 'Actualizar imagen de perfil',
        description: 'Actualiza la imagen de perfil del usuario autenticado (requiere autenticación)'
    })
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Archivo de imagen para el perfil',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen (JPEG, PNG, etc.)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Imagen de perfil actualizada exitosamente',
        schema: {
            example: {
                message: "Imagen de perfil cambiada correctamente."
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'No se proporcionó archivo de imagen',
        schema: {
            example: {
                statusCode: 400,
                message: 'Debe subir un archivo de imagen',
                error: 'Bad Request'
            }
        }
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado',
        schema: {
            example: {
                statusCode: 404,
                message: 'El usuario no fue encontrado',
                error: 'Not Found'
            }
        }
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `user-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async uploadProfileImage(@Req() req, @UploadedFile() file?: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Debe subir un archivo de imagen.');
        }

        const userId = req.user['id'];
        const imageUrl = `/uploads/${file.filename}`;
        return this.usersService.updateProfileImage(userId, imageUrl);
    }
}