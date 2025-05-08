import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { ReviewsService } from "./services/reviews.service";
import { ReviewsController } from "./controllers/reviews.controller";
import { UsersModule } from "src/users/users.module";
import { PeliculasModule } from "src/peliculas/peliculas.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        UsersModule,
        PeliculasModule,
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController]
})
export class ReviewsModule {}