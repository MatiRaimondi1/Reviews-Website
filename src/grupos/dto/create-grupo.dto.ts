import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
