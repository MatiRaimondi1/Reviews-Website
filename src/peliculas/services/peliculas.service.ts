import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, ILike, Repository } from 'typeorm';
import { Pelicula } from '../entities/pelicula.entity';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { Genero } from 'src/generos/entities/genero.entity';

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
        @InjectRepository(Genero) private generosRepo: Repository<Genero>,
        @InjectRepository(Pelicula) private peliculasRepo: Repository<Pelicula>,
    ) { }

    /**
     * Obtiene una lista paginada de películas.
     * 
     * @param page Número de página (comienza en 0). Por defecto, es 0.
     * @returns Promesa con una lista de hasta 10 películas.
     */
    async findAll(page = 0, alphabetic?: 'asc' | 'desc', rating?: 'asc' | 'desc') {
        const limit = 10;
        const offset = page * limit;

        const order: any = {};

        if (alphabetic) {
            order.nombre = alphabetic.toUpperCase();
        } else if (rating) {
            order.calificacion = rating.toUpperCase();
        } else {
            order.nombre = 'ASC';
        }

        const peliculas = await this.peliculasRepo.find({
            order,
            skip: offset,
            take: limit,
        });

        if (!peliculas || peliculas.length === 0) {
            throw new NotFoundException(`No se encontraron películas.`);
        }

        return peliculas;
    }

    /**
     * Obtiene una lista paginada de peliculas por genero.
     * 
     * @param nombreGenero Nombre del genero de la pelicula.
     * @param page Número de página (comienza en 0). Por defecto, es 0.
     * @returns Promesa con una lista de hasta 10 peliculas por genero.
     */
    async findByGenero(nombreGenero: string, page = 0, alphabetic?: 'asc' | 'desc', rating?: 'asc' | 'desc') {
        if (!nombreGenero || nombreGenero.trim() === '') {
            throw new BadRequestException('El género no puede estar vacío.');
        }

        const limit = 10;
        const offset = page * limit;
        
        const order: any = {};

        if (alphabetic) {
            order.nombre = alphabetic.toUpperCase();
        } else if (rating) {
            order.calificacion = rating.toUpperCase();
        } else {
            order.nombre = 'ASC';
        }

        const peliculas = await this.peliculasRepo.find({
            where: {
                genero: {
                    nombre: nombreGenero
                }
            },
            order,
            skip: offset,
            take: limit,
        });

        if (!peliculas || peliculas.length === 0) {
            throw new NotFoundException(`No se encontraron películas con el género '${nombreGenero}'.`);
        }

        return peliculas;
    }

    /**
     * Busca una película por su ID.
     * 
     * @param id Identificador de la película.
     * @returns Promesa con la película encontrada.
     */
    async findOne(id: number) {
        const pelicula = await this.peliculasRepo.findOneBy({ id: id });

        if (!pelicula) {
            throw new NotFoundException(`No se encontró una película con el ID ${id}.`);
        }

        return pelicula;
    }

    /**
     * Busca todas las peliculas que coincidan con un cierto termino de busqueda
     * 
     * @param key Nombre parcial de la/s pelicula/s a buscar
     * @returns Promesa con todas las peliculas que coincidan
     */
    async findByKey(key: string) {
        const peliculas = await this.peliculasRepo.find({
            where: {
                nombre: ILike(`%${key}%`),
            },
            order: { nombre: 'ASC' },
        });

        if (!peliculas || peliculas.length === 0) {
            throw new NotFoundException("No se encontraron peliculas.")
        }

        return peliculas;
    }

    /**
     * Crea una nueva película en la base de datos.
     * 
     * @param dto DTO con los datos necesarios para crear una película.
     * @param urlImagen URL de la imagen de la pelicula.
     * @returns Promesa con la película creada.
     */
    async create(dto: CreatePeliculaDto, urlImagen: string | null) {
        const existe = await this.peliculasRepo.findOne({ where: { nombre: dto.nombre } });

        if (existe) {
            throw new ConflictException('Ya existe una pelicula con ese nombre.');
        }

        let genero = await this.generosRepo.findOne({
            where: { nombre: dto.genero.trim() },
        });

        if (!genero) {
            genero = this.generosRepo.create({ nombre: dto.genero.trim() });
            genero = await this.generosRepo.save(genero);
        }

        const newPelicula = this.peliculasRepo.create({
            ...dto,
            genero,
            urlImagen: urlImagen ?? undefined,
        });

        return await this.peliculasRepo.save(newPelicula);
    }

    /**
     * Actualiza una película existente por su ID.
     * 
     * @param id ID de la película a actualizar.
     * @param body DTO con los campos a modificar.
     * @returns Promesa con la película actualizada.
     */

    async update(id: number, body: UpdatePeliculaDto) {
        const pelicula = await this.peliculasRepo.findOne({
            where: { id },
            relations: ['genero'],
        });

        if (!pelicula) {
            throw new NotFoundException(`Pelicula con ID ${id} no encontrada`);
        }

        let genero: Genero | undefined = await this.generosRepo.findOneBy({ nombre: body.genero }) ?? undefined;

        if (body.genero) {
            if (!genero) {
                genero = this.generosRepo.create({ nombre: body.genero });
                genero = await this.generosRepo.save(genero);
            }
        }

        const datosActualizados: DeepPartial<Pelicula> = {
            ...body,
            genero: genero,
        };

        this.peliculasRepo.merge(pelicula, datosActualizados);
        return this.peliculasRepo.save(pelicula);
    }

    /**
     * Elimina una película por su ID.
     * 
     * @param id ID de la película a eliminar.
     * @returns Promesa que resuelve en `true` si la operación fue exitosa.
     */
    async delete(id: number) {
        const result = await this.peliculasRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`No se encontró una película con el ID ${id}.`);
        }

        return { success: true, message: 'Película eliminada correctamente.' };
    }
}
