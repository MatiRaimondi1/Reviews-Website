import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Genero } from "./entities/genero.entity";
import { GenerosService } from "./services/generos.service";
import { GenerosController } from "./controllers/generos.controller";

/**
 * Encapsula los providers de la entidad Genero, y define que partes 
 * pueden importarse en otros modulos
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Genero]),
    ],
    providers: [GenerosService],
    controllers: [GenerosController]
})
export class GenerosModule {}