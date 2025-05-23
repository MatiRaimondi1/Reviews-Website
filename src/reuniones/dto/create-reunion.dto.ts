import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class CreateReunionDto {
    @Type(() => Date)
    @IsDate()
    fecha: Date;

    @IsString()
    link: string;
}