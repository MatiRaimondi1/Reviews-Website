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

    @IsNumber()
    duracion: number;

    @IsString()
    urlImagen: string;

    @IsNumber()
    calificacion: number;
}