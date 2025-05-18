import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pelicula } from '../entities/pelicula.entity';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';

/**
 * Servicio encargado de gestionar las operaciones relacionadas con las películas.
 */
@Injectable()
export class PeliculasService {
    
    /**
     * Inyecta el repositorio de películas.
     * @param peliculasRepo Repositorio de la entidad `Pelicula`.
     */
    constructor(
        @InjectRepository(Pelicula) 
        private peliculasRepo: Repository<Pelicula>,
    ) {}

    /**
     * Obtiene una lista paginada de películas.
     * 
     * @param page Número de página (comienza en 0). Por defecto, es 0.
     * @returns Promesa con una lista de hasta 10 películas.
     */
    async findAll(page = 0) {
        const limit = 10;
        const offset = page * limit;
        return this.peliculasRepo.find({
            skip: offset,
            take: limit,
        });
    }

    /**
     * Busca una película por su ID.
     * 
     * @param id Identificador de la película.
     * @returns Promesa con la película encontrada o `null` si no existe.
     */
    async findOne(id: number) {
        return this.peliculasRepo.findOneBy({ id });
    }

    /**
     * Crea una nueva película en la base de datos.
     * 
     * @param body DTO con los datos necesarios para crear una película.
     * @returns Promesa con la película creada.
     */
    async create(body: CreatePeliculaDto) {
        const newPelicula = this.peliculasRepo.create(body);
        return this.peliculasRepo.save(newPelicula);
    }

    /**
     * Actualiza una película existente por su ID.
     * 
     * @param id ID de la película a actualizar.
     * @param body DTO con los campos a modificar.
     * @throws `NotFoundException` si la película no existe.
     * @returns Promesa con la película actualizada.
     */
    async update(id: number, body: UpdatePeliculaDto) {
        const pelicula = await this.peliculasRepo.findOneBy({ id });
        
        if (!pelicula) {
            throw new NotFoundException(`Pelicula con ID ${id} no encontrada`);
        }
        
        this.peliculasRepo.merge(pelicula, body);
        return this.peliculasRepo.save(pelicula);
    }

    /**
     * Elimina una película por su ID.
     * 
     * @param id ID de la película a eliminar.
     * @returns Promesa que resuelve en `true` si la operación fue exitosa.
     */
    async delete(id: number) {
        await this.peliculasRepo.delete(id);
        return true;
    }
}
