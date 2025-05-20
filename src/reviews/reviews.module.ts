import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { ReviewsService } from "./services/reviews.service";
import { ReviewsController } from "./controllers/reviews.controller";
import { UsersModule } from "src/users/users.module";
import { PeliculasModule } from "src/peliculas/peliculas.module";
import { GrupoModule } from "src/grupos/grupo.module";
import { Grupo } from "src/grupos/entities/grupo.entity";

/**
 * Encapsula los providers de la entidad Reviews, y define que partes 
 * pueden importarse en otros modulos
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Grupo]),
        UsersModule,
        PeliculasModule,
        GrupoModule,
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController]
})
export class ReviewsModule {}