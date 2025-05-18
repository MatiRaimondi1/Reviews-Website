import { Module } from '@nestjs/common';
import { ComentariosService } from './services/comentarios.service';
import { ComentariosController } from './controllers/comentarios.controller';
import { UsersModule } from 'src/users/users.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from './entities/comentario.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comentario, Review, User]),
        UsersModule,
        ReviewsModule
    ],
    providers: [ComentariosService],
    controllers: [ComentariosController]
})
export class ComentariosModule {}
