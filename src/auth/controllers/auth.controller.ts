import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/**
 * Controlador encargado de manejar las requests relativas a la autenticación de usuarios
 */
@Controller('api/auth')
export class AuthController {

    /**
     * Inyecta el servicio de autenticación
     * @param authService Servicio que contiene la logica de negocio de autenticación
     */
    constructor(
        private readonly authService: AuthService,
    ) {}

    /**
    * Endpoint para registrar un nuevo usuario.
    * 
    * @param registerDto - DTO que contiene el username, email y password del nuevo usuario.
    * @returns El usuario creado.
    */
    @Post('register')
    register(@Body() registerDto: RegisterDto,) {
        return this.authService.register(registerDto);
    }

    /**
    * Endpoint para iniciar sesión.
    * 
    * @param loginDto - DTO que contiene el email y password del usuario.
    * @returns Un objeto con el token de acceso y un mensaje de confirmación.
    */
    @UseGuards(ThrottlerGuard)
    @Post('login')
    login(@Body() loginDto: LoginDto,) {
        return this.authService.login(loginDto);
    }

}
