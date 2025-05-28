import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class CreatePeliculaDto {
    @IsString()
    nombre: string;

    @IsString()
    sinopsis: string;

    @IsString()
    genero: string;

    @IsString()
    fechaEstreno: Date;

    @Type(() => Number)
    @IsNumber()
    duracion: number;

    @Type(() => Number)
    @IsNumber()
    calificacion: number;
}