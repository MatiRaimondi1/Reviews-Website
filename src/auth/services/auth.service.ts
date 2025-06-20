import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';

/**
 * Servicio encargado de gestionar las operaciones relacionadas a la autenticación de usuarios
 */
@Injectable()
export class AuthService {
    
    /**
     * Constructor del serivicio de autenticación
     * 
     * @param usersService Importación del servicio de usuarios
     * @param jwtService Importación del servicio JWT
     */
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    /**
    * Registra un nuevo usuario en el sistema.
    *
    * @param dto DTO que contiene `username`, `email` y `password`.
    * @returns El usuario creado.
    */
    async register({ username, email, password }: RegisterDto) {
        const user_email = await this.usersService.findOneByEmail(email);
        const user_username = await this.usersService.findOneByUsername(username)
        
        if (user_username || user_email) {
            throw new BadRequestException('Ya existe un usuario con ese email o nombre.');
        }
        
        return await this.usersService.create({ username,
            email,
            password: await bcrypt.hash(password, 10)
        });
    }

    /**
    * Autentica a un usuario con email y contraseña.
    *
    * @param dto - DTO que contiene `email` y `password`.
    * @returns Un objeto con el token JWT y un mensaje de confirmación.
    */
    async login({ email, password }: LoginDto) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException('El email o la contraseña son incorrectos.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('El email o la contraseña son incorrectos.');
        }

        const payload = { sub: user.id, role: user.rol };
        const token = await this.jwtService.signAsync(payload);

        return {"access_token": token, "mensaje": "Login correcto."};
    }
}