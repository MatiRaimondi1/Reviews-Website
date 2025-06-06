import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Genero } from "./entities/genero.entity";
import { GenerosService } from "./services/generos.service";
import { GenerosController } from "./controllers/generos.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Genero]),
    ],
    providers: [GenerosService],
    controllers: [GenerosController]
})
export class GenerosModule {}