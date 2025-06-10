import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { CreateReviewDto } from "../dto/create-review.dto";
import { Grupo } from "src/grupos/entities/grupo.entity";

/**
 * Servicio encargado de gestionar las operaciones relacionadas con las reviews
 */
@Injectable()
export class ReviewsService {

    /**
     * Inyecta los repositorios
     */
    constructor(
        @InjectRepository(Review) private reviewsRepo: Repository<Review>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Pelicula) private peliculasRepo: Repository<Pelicula>,
        @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    ) { }

    /**
     * Logica de la creacion de una Review
     * 
     * @param dto el DTO definido para la creacion de una review
     * @param userId ID del usuario que publica la review
     * @param peliculaId ID de la pelicula de la cual la review se trata
     * @param grupoId ID del grupo que publica la review, en caso de ser necesario
     * @returns Promesa con la creacion de la nueva review
     */
    async create(dto: CreateReviewDto, userId: number, peliculaId: number, grupoId?: number) {
        const user = await this.usersRepo.findOneBy({ id: userId });
        const pelicula = await this.peliculasRepo.findOneBy({ id: peliculaId });
        if (!user || !pelicula) throw new NotFoundException('Usuario o pelicula no encontrados.');

        if (grupoId) {
            const grupo = await this.grupoRepo.findOne({
                where: { id: grupoId },
                relations: ['usuariosRelacionados', 'usuariosRelacionados.user'],
            });
            if (!grupo) throw new NotFoundException("Grupo no encontrado.");

            const miembro = grupo.usuariosRelacionados.find(m => m.user.id === userId);
            if (!miembro || miembro.rol !== 'lider') {
                throw new ForbiddenException('Solo el lider del grupo puede crear una review grupal.');
            }

            const existingGroupReview = await this.reviewsRepo
                .createQueryBuilder('review')
                .where('review.grupoId = :grupoId', { grupoId })
                .andWhere('review.peliculaId = :peliculaId', { peliculaId })
                .getOne();
            if (existingGroupReview) {
                throw new ConflictException("Ya existe una review grupal para esta pelicula.")
            }

            const review = this.reviewsRepo.create({
                texto: dto.texto,
                puntuacion: dto.puntuacion,
                user,
                pelicula,
                grupo,
            });
            return this.reviewsRepo.save(review);
        } else {
            const existingReview = await this.reviewsRepo
                .createQueryBuilder('review')
                .where('review.userId = :userId', { userId })
                .andWhere('review.peliculaId = :peliculaId', { peliculaId })
                .getOne();
            if (existingReview) {
                throw new ConflictException("Ya existe una review para esta pelicula por este usuario.");
            }

            const review = this.reviewsRepo.create({
                texto: dto.texto,
                puntuacion: dto.puntuacion,
                user,
                pelicula,
            });
            return this.reviewsRepo.save(review);
        }
    }

    /**
     * Logica de la busqueda de reviews sobre una pelicula especifica
     * 
     * @param peliculaId ID de la pelicula a buscar
     * @returns Promesa con las reviews encontradas junto a los usuarios que las publicaron
     */
    async findByPelicula(peliculaId: number, page = 0) {
        const limit = 10;
        const offset = page * limit;

        const reviews = await this.reviewsRepo.find({
            where: {
                pelicula: { id: peliculaId }
            },
            skip: offset,
            take: limit,
            relations: ['user'],
        });

        if (!reviews || reviews.length === 0) {
            throw new NotFoundException("No se encontraron reviews para esta pelicula.")
        }

        return reviews;
    }

    /**
     * Logica para buscar todas las reviews que hizo un usuario en especifico
     * 
     * @param userId ID del usuario a buscar
     * @returns Promesa con todas las reviews que hizo un usuario en especifico sin importar la pelicula
     */
    async findByUsuario(userId: number, page = 0) {
        const limit = 10;
        const offset = page * limit;

        const reviews = await this.reviewsRepo.find({
            where: {
                user: { id: userId },
            },
            skip: offset,
            take: limit,
            relations: ['pelicula'],
            order: { id: 'DESC' },
        });

        if (!reviews || reviews.length === 0) {
            throw new NotFoundException("Este usuario no hizo ninguna review.")
        }

        return reviews;
    }

    /**
     * Cuenta la cantidad de reviews que hizo un usuario en especifico
     * 
     * @param userId ID del usuario a buscar
     * @returns Promesa con la cantidad de reviews que hizo un usuario en especifico sin importar la pelicula
     */
    async countByUsuario(userId: number): Promise<number> {
        const reviews = await this.reviewsRepo.find({
            where: {
                user: { id: userId },
            },
            relations: ['pelicula'],
            order: { id: 'DESC' },
        });

        if (!reviews || reviews.length === 0) {
            throw new NotFoundException("Este usuario no hizo ninguna review.")
        }

        return reviews.length;
    }

    async edit(id: number, userId: number, updateData: { texto?: string; puntuacion?: number }) {
        const review = await this.reviewsRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!review) {
            throw new BadRequestException("Reseña no encontrada");
        }

        const user = await this.usersRepo.findOneBy({ id: userId });
        if (!user) {
            throw new BadRequestException("Usuario no encontrado.");
        }

        const esAutor = review.user.id === userId;
        const esAdmin = user.rol === 'admin';

        if (!esAutor && !esAdmin) {
            throw new BadRequestException("No puedes editar una reseña que no has creado");
        }

        if (updateData.texto !== undefined) {
            review.texto = updateData.texto;
        }
        if (updateData.puntuacion !== undefined) {
            review.puntuacion = updateData.puntuacion;
        }

        return this.reviewsRepo.save(review);
    }

    /**
     * Logica para la eliminacion de una review
     * 
     * @param id ID de la review a borrar
     * @param userId ID del usuario que quiere realizar esta accion
     */
    async delete(id: number, userId: number) {
        const review = await this.reviewsRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!review) {
            throw new BadRequestException("Reseña no encontrada");
        }

        const user = await this.usersRepo.findOneBy({ id: userId });
        if (!user) {
            throw new BadRequestException("Usuario no encontrado.");
        }

        const esAutor = review.user.id === userId;
        const esAdmin = user.rol === 'admin';

        if (!esAutor && !esAdmin) {
            throw new BadRequestException("No puedes eliminar una reseña que no has creado");
        }

        await this.reviewsRepo.remove(review);
    }
}