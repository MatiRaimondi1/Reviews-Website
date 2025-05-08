import { IsInt, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @IsString()
    texto: string;

    @IsInt()
    @Min(1)
    @Max(10)
    puntuacion: number;
}