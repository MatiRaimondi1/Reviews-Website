import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Genero } from "../entities/genero.entity";
import { Repository } from "typeorm";

/**
 * Servicio encargado de gestionar las operaciones relacionadas con generos
 */
@Injectable()
export class GenerosService {

    /**
     * Inyecta los repositorios relativos a los generos
     * @param generosRepo Repositorio de generos
     */
    constructor(
        @InjectRepository(Genero) private generosRepo: Repository<Genero>,
    ) {}

    /**
     * Trae una lista con todos los generos disponibles
     * @returns Promesa con lista de generos
     */
    async findAll() {
        const generos = await this.generosRepo.find()
        if (!generos || generos.length === 0) {
            throw new NotFoundException("No se encontraron generos.")
        }
        return generos;
    }

    /**
     * Busca un genero por nombre
     * @param nombreGenero Nombre del genero
     * @returns Promesa con el genero con dicho nombre
     */
    async findByName(nombreGenero: string) {
        const genero = await this.generosRepo.findOneBy({ nombre: nombreGenero });
        if (!genero) {
            throw new NotFoundException("No se encontro un genero con ese nombre.")
        }
        return genero;
    }

    /**
     * Busca un genero por id
     * @param idGenero ID del genero
     * @returns Promesa con el genero con dicho ID
     */
    async findById(idGenero: number) {
        const genero = await this.generosRepo.findOneBy({ id: idGenero });
        if (!genero) {
            throw new NotFoundException("No se encontro un genero con ese nombre.")
        }
        return genero;
    }
}