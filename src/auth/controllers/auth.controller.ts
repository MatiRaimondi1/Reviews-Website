import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    @ApiOperation({
        summary: 'Registro de usuario',
        description: 'Crea una nueva cuenta de usuario en el sistema'
    })
    @ApiBody({
        type: RegisterDto,
        description: 'Datos requeridos para el registro',
        examples: {
            ejemplo1: {
                summary: 'Registro básico',
                value: {
                    username: 'usuario1',
                    email: 'usuario@example.com',
                    password: 'Password123!'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario registrado exitosamente',
        schema: {
            example: {
                id: 1,
                username: 'usuario1',
                email: 'usuario@example.com',
                rol: 'user',
                createdAt: '2023-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiBadRequestResponse({
        description: 'Error en los datos de entrada o usuario ya existe',
        schema: {
            example: {
                statusCode: 400,
                message: 'Ya existe un usuario con ese email o nombre',
                error: 'Bad Request'
            }
        }
    })
    register(@Body() registerDto: RegisterDto,) {
        return this.authService.register(registerDto);
    }


    @UseGuards(ThrottlerGuard)
    @Post('login')
    @ApiOperation({
        summary: 'Inicio de sesión',
        description: 'Autentica a un usuario y devuelve un token JWT. Limitado por tasa de solicitudes.'
    })
    @ApiBody({
        type: LoginDto,
        description: 'Credenciales de acceso',
        examples: {
            ejemplo1: {
                summary: 'Login básico',
                value: {
                    email: 'usuario@example.com',
                    password: 'Password123!'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Inicio de sesión exitoso',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                mensaje: 'Login correcto.'
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Credenciales inválidas',
        schema: {
            example: {
                statusCode: 401,
                message: 'El email o la contraseña son incorrectos',
                error: 'Unauthorized'
            }
        }
    })
    @ApiResponse({
        status: 429,
        description: 'Demasiados intentos de login. Por favor intente más tarde'
    })
    login(@Body() loginDto: LoginDto,) {
        return this.authService.login(loginDto);
    }
}