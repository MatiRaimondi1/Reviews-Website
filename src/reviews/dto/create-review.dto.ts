import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @ApiProperty({
        description: 'Texto de la review',
        example: 'Excelente película, muy recomendable',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    texto: string;

    @ApiProperty({
        description: 'Puntuación de la película (1-10)',
        example: 9,
        minimum: 1,
        maximum: 10,
        required: true
    })
    @IsInt()
    @Min(1)
    @Max(10)
    puntuacion: number;

    @ApiProperty({
        description: 'ID del grupo (opcional, para reviews grupales)',
        example: 1,
        required: false
    })
    @IsOptional()
    @IsInt()
    grupoId?: number;
}