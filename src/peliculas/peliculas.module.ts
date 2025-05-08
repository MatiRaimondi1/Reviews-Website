import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PeliculasService } from './services/peliculas.service';
import { PeliculasController } from './controllers/peliculas.controller';
import { Pelicula } from './entities/pelicula.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pelicula])
  ],
  providers: [PeliculasService],
  controllers: [PeliculasController],
  exports: [PeliculasService, TypeOrmModule]
})
export class PeliculasModule {}
