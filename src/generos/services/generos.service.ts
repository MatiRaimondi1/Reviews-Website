import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Genero } from "../entities/genero.entity";
import { Repository } from "typeorm";

@Injectable()
export class GenerosService {
    constructor(
        @InjectRepository(Genero) private generosRepo: Repository<Genero>,
    ) {}

    async findAll() {
        const generos = await this.generosRepo.find()
        if (!generos || generos.length === 0) {
            throw new NotFoundException("No se encontraron generos.")
        }
        return generos;
    }

    async findByName(nombreGenero: string) {
        const genero = await this.generosRepo.findOneBy({ nombre: nombreGenero });
        if (!genero) {
            throw new NotFoundException("No se encontro un genero con ese nombre.")
        }
        return genero;
    }

    async findById(idGenero: number) {
        const genero = await this.generosRepo.findOneBy({ id: idGenero });
        if (!genero) {
            throw new NotFoundException("No se encontro un genero con ese nombre.")
        }
        return genero;
    }
}