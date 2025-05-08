import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { CreateReviewDto } from "../dto/create-review.dto";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review) private reviewsRepo: Repository<Review>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Pelicula) private peliculasRepo: Repository<Pelicula>,
    ) {}

    async create(dto: CreateReviewDto, userId: number, peliculaId: number) {
        const user = await this.usersRepo.findOneBy({ id: userId });
        const pelicula = await this.peliculasRepo.findOneBy({ id: peliculaId });
        
        if (!user || !pelicula) throw new NotFoundException('Usuario o pelicula no encontrados.');

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

        if (review.user.id !== userId) {
            throw new BadRequestException("No puedes eliminar una reseña que no has creado");
        }

        await this.reviewsRepo.remove(review);
    }
}