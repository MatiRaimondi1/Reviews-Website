import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateGrupoDto {
    @ApiProperty({
        description: 'Nombre del grupo',
        example: 'Grupo 1',
        minLength: 3,
        required: true
    })
    @IsString()
    @MinLength(3)
    nombre: string;

    @ApiProperty({
        description: 'Descripción del grupo (Opcional)',
        example: 'Descripción',
        required: false
    })
    @IsString()
    @IsOptional()
    descripcion?: string;
}