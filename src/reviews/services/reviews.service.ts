import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { CreateReviewDto } from "../dto/create-review.dto";
import { Grupo } from "src/grupos/entities/grupo.entity";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review) private reviewsRepo: Repository<Review>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Pelicula) private peliculasRepo: Repository<Pelicula>,
        @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    ) {}

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

    async findByPelicula(peliculaId: number) {
        return this.reviewsRepo.find({
            where: {
                pelicula: { id: peliculaId }
            },
            relations: ['user'],
        });
    }

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