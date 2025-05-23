import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateReunionDto } from "../dto/create-reunion.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Reunion } from "../entities/reunion.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Grupo } from "src/grupos/entities/grupo.entity";

@Injectable()
export class ReunionService {
    constructor(
        @InjectRepository(Reunion) private reunionRepo: Repository<Reunion>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    ) {}

    async create(userId: number, dto: CreateReunionDto) {
        const user = await this.findUserWithGroups(userId);
        
        const relacion = user.gruposRelacionados.find(rel => rel.rol === 'lider');
        if (!relacion) {
            throw new ForbiddenException("Solo el líder del grupo puede crear una reunión.");
        }

        const grupo = relacion.grupo;

        const existingReunion = await this.reunionRepo.findOne({
            where: { grupo: { id: grupo.id } },
        });
        if (existingReunion) {
            throw new ConflictException("Ya existe una reunión para este grupo.");
        }

        const reunion = this.reunionRepo.create({
            fecha: dto.fecha,
            link: dto.link,
            grupo,
        });
        return this.reunionRepo.save(reunion);
    }

    async delete(userId: number, reunionId: number) {
        const user = await this.findUserWithGroups(userId);

        const reunion = await this.reunionRepo.findOne({
            where: { id: reunionId },
            relations: ['grupo'],
        });
        if (!reunion) {
            throw new BadRequestException("Reunión no encontrada.")
        }

        const relacion = user.gruposRelacionados.find(
            rel => rel.rol === 'lider' && rel.grupo.id === reunion.grupo.id
        );
        if (!relacion) {
            throw new ForbiddenException('Solo el líder del grupo puede eliminar la reunión.');
        }

        await this.reunionRepo.remove(reunion);
        return { message: 'Reunión eliminada correctamente.' };
    }

    async getReunionByGrupo(userId: number, grupoId: number) {
        const user = await this.findUserWithGroups(userId);

        const pertenece = user.gruposRelacionados.some(
            rel => rel.grupo.id === grupoId
        );
        if (!pertenece) {
            throw new ForbiddenException('No tienes permiso para ver la reunión de este grupo.');
        }

        const reunion = await this.reunionRepo.findOne({
            where: { grupo: { id: grupoId } },
            relations: ['grupo'],
        });
        if (!reunion) {
            throw new NotFoundException('No se encontró reunión para este grupo.');
        }

        return reunion;
    }

    private async findUserWithGroups(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['gruposRelacionados', 'gruposRelacionados.grupo'],
        });

        if (!user) {
            throw new BadRequestException("Usuario no encontrado.");
        }

        return user;
    }
}