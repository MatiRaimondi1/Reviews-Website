import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateComentarioDto {
    @ApiProperty({
        description: 'Texto del comentario',
        example: 'Estoy totalmente de acuerdo con tu análisis',
        minLength: 1,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    texto: string;
}