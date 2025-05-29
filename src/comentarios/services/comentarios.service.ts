import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Comentario } from "../entities/comentario.entity";
import { Repository } from "typeorm";
import { Review } from "src/reviews/entities/review.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class ComentariosService {
    constructor(
        @InjectRepository(Comentario) private readonly comentariosRepo: Repository<Comentario>,
        @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
    ) {}

    async create(reviewId: number, userId: number, dto: CreateComentarioDto) {
        const review = await this.reviewsRepo.findOneBy({ id: reviewId });
        const user = await this.usersRepo.findOneBy({ id: userId });

        if (!review || !user) throw new NotFoundException('Review o usuario no encontrado');

        const comentario = this.comentariosRepo.create({
            texto: dto.texto,
            user,
            review
        });

        return this.comentariosRepo.save(comentario);
    }

    async findByReview(reviewId: number) {
        const review = await this.reviewsRepo.findOneBy({ id: reviewId });
        
        if (!review) {
            throw new NotFoundException('No se encontro una review con este id.')
        }

        const comentarios = await this.comentariosRepo.find({
            where: {
                review: { id: reviewId }
            },
            relations: ['user'],
        });
        
        if (!comentarios || comentarios.length === 0) {
            throw new NotFoundException('No se encontraron comentarios para esta review.')
        }

        return comentarios;
    }

    async remove(comentarioId: number, userId: number) {
        const comentario = await this.comentariosRepo.findOne({
            where: { id: comentarioId },
            relations: ['user'],
        });
        if (!comentario) {
            throw new NotFoundException("Comentario no encontrado.");
        }

        const user = await this.usersRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException("Usuario no encontrado.");
        }

        const esAutor = comentario.user.id === userId;
        const esAdmin = user.rol === 'admin';

        if (!esAutor && !esAdmin) {
            throw new ForbiddenException("No tienes permiso para eliminar este comentario.");
        }

        this.comentariosRepo.remove(comentario)
        return { success: true, message: 'Comentario eliminado correctamente.' };
    }
}