import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreatePeliculaDto {
    @ApiProperty({
        example: 'El Padrino',
        description: 'Nombre de la película',
        required: true
    })
    @IsString()
    nombre: string;

    @ApiProperty({
        example: 'La historia de la familia Corleone...',
        description: 'Sinopsis de la película',
        required: true
    })
    @IsString()
    sinopsis: string;

    @ApiProperty({
        example: 'Drama',
        description: 'Género de la película',
        required: true
    })
    @IsString()
    genero: string;

    @ApiProperty({
        example: '1972-03-24',
        description: 'Fecha de estreno (YYYY-MM-DD)',
        required: true
    })
    @IsString()
    fechaEstreno: Date;

    @ApiProperty({
        example: 175,
        description: 'Duración en minutos',
        required: true
    })
    @Type(() => Number)
    @IsNumber()
    duracion: number;

    @ApiProperty({
        example: 9.2,
        description: 'Calificación (0-10)',
        minimum: 0,
        maximum: 10,
        required: true
    })
    @Type(() => Number)
    @IsNumber()
    calificacion: number;
}