import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateReunionDto } from "../dto/create-reunion.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Reunion } from "../entities/reunion.entity";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Grupo } from "src/grupos/entities/grupo.entity";

/**
 * Servicio encargado de gestionar las operaciones relacionadas con las reuniones
 */
@Injectable()
export class ReunionService {

    /**
     * Inyecta los repositorios relativos a las reuniones
     * @param reunionRepo Repositorio de reuniones
     * @param userRepo Repositorio de usuarios
     * @param grupoRepo Repositorio de grupos
     */
    constructor(
        @InjectRepository(Reunion) private reunionRepo: Repository<Reunion>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    ) { }

    /**
     * Crea una reunion
     * @param userId ID del usuario que crea la reunion
     * @param dto el DTO establecido para la creacion de reuniones
     * @returns Promesa con la creacion de la reunion
     */
    async create(userId: number, dto: CreateReunionDto) {
        const relacion = await this.getLiderRelacion(userId);
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

    /**
     * Borra una reunion
     * @param userId ID del usuario que borra la reunion
     * @returns Mensaje de confirmacion de la eliminacion de la reunion
     */
    async delete(userId: number) {
        const relacion = await this.getLiderRelacion(userId);

        const reunion = await this.reunionRepo.findOne({
            where: { grupo: { id: relacion.grupo.id } },
            relations: ['grupo'],
        });

        if (!reunion) {
            throw new BadRequestException("No se encontraron reuniones para eliminar.");
        }

        await this.reunionRepo.remove(reunion);
        return { message: 'Reunión eliminada correctamente.' };
    }

    /**
     * Obtiene la reunion vigente de un grupo
     * @param userId Usuario que hace el pedido
     * @returns Promesa de la reunion obtenida
     */
    async getReunion(userId: number) {
        const relacion = await this.getRelacionUsuario(userId);

        const reunion = await this.reunionRepo.findOne({
            where: { grupo: { id: relacion.grupo.id } },
            relations: ['grupo'],
        });

        if (!reunion) {
            throw new NotFoundException('No se encontró reunión para tu grupo.');
        }

        return reunion;
    }

    /**
     * Busca si un usuario pertenece a un grupo en particular
     * @param userId ID del usuario a buscar
     * @returns El usuario, en caso de que se haya obtenido
     */
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

    /**
    * Obtiene la relación de grupo donde el usuario tiene el rol de líder.
    *
    * @param userId - ID del usuario que se desea verificar.
    * @returns La relación del usuario con el grupo donde es líder.
    */
    private async getLiderRelacion(userId: number) {
        const user = await this.findUserWithGroups(userId);
        const relacion = user.gruposRelacionados.find(rel => rel.rol === 'lider');

        if (!relacion) {
            throw new ForbiddenException('Solo el líder del grupo puede realizar esta acción.');
        }

        return relacion;
    }

    /**
     * Obtiene la primera relación del usuario con algún grupo, sin importar el rol.
    *
    * @param userId - ID del usuario que se desea verificar.
    * @returns La primera relación del usuario con un grupo.
    */
    private async getRelacionUsuario(userId: number) {
        const user = await this.findUserWithGroups(userId);
        const relacion = user.gruposRelacionados[0];

        if (!relacion) {
            throw new ForbiddenException('No perteneces a ningún grupo.');
        }

        return relacion;
    }
}