import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeliculasModule } from './peliculas/peliculas.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ReviewsModule } from './reviews/reviews.module';
import { GrupoModule } from './grupos/grupo.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { ReunionModule } from './reuniones/reuniones.module';
import { GenerosModule } from './generos/generos.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: ['dist/**/*.entity{.ts,.js}'],
            synchronize: true,
            retryDelay: 3000,
            retryAttempts: 10
        }),
        PeliculasModule,
        UsersModule,
        AuthModule,
        ReviewsModule,
        GrupoModule,
        ComentariosModule,
        ReunionModule,
        GenerosModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }