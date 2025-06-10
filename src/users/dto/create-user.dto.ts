import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Nombre de usuario (único)',
        example: 'usuario1',
        minLength: 3,
        required: true
    })
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({
        description: 'Correo electrónico (único)',
        example: 'usuario@example.com',
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña (mínimo 8 caracteres)',
        example: 'Password123',
        minLength: 8,
        required: true
    })
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;
}