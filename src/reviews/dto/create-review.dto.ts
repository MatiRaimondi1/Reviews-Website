import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    texto: string;

    @IsInt()
    @Min(1)
    @Max(10)
    puntuacion: number;

    @IsOptional()
    @IsInt()
    grupoId?: number;
}