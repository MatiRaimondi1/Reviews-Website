import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pelicula } from '../entities/pelicula.entity';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';

@Injectable()
export class PeliculasService {

    constructor(
        @InjectRepository(Pelicula) 
        private peliculasRepo: Repository<Pelicula>,
    ) {}

    findAll() {
        return this.peliculasRepo.find();
    }

    findOne(id: number) {
        return this.peliculasRepo.findOneBy({ id });
    }

    create(body: CreatePeliculaDto) {
        const newPelicula = this.peliculasRepo.create(body);
        return this.peliculasRepo.save(newPelicula);
    }

    async update(id: number, body: UpdatePeliculaDto) {
        const pelicula = await this.peliculasRepo.findOneBy({ id });
        
        if (!pelicula) {
            throw new NotFoundException(`Pelicula con ID ${id} no encontrada`);
        }
        
        this.peliculasRepo.merge(pelicula, body);
        return this.peliculasRepo.save(pelicula);
    }

    async delete(id: number) {
        await this.peliculasRepo.delete(id);
        return true;
    }
}
