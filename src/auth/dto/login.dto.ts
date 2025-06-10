import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: 'Correo electrónico registrado',
        example: 'usuario@example.com',
        required: true
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña',
        example: 'Password123',
        required: true
    })
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;
}