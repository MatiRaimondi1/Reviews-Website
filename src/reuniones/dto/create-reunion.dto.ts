import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class CreateReunionDto {
    @ApiProperty({
        description: 'Fecha y hora de la reunión en formato ISO 8601',
        example: '2023-12-15T20:00:00Z',
        required: true
    })
    @Type(() => Date)
    @IsDate()
    fecha: Date;

    @ApiProperty({
        description: 'URL del enlace a la reunión virtual',
        example: 'https://meet.google.com/abc-def-ghi',
        required: true
    })
    @IsString()
    link: string;
}