import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Comentario } from "../entities/comentario.entity";
import { Repository } from "typeorm";
import { Review } from "src/reviews/entities/review.entity";
import { User } from "src/users/entities/user.entity";

/**
 * Servicio encargado de manejar las operaciones relacionadas con los comentarios
 */
@Injectable()
export class ComentariosService {
    /**
     * Inyecta los repositorios
     * @param comentariosRepo Repositorio de comentarios
     * @param reviewsRepo Repositorio de reviews
     * @param usersRepo Repositorio de usuarios
     */
    constructor(
        @InjectRepository(Comentario) private readonly comentariosRepo: Repository<Comentario>,
        @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
    ) {}

    /**
     * Crea un comentario
     * @param reviewId ID de la review en la que se comenta
     * @param userId ID del usuario que realiza el comentario
     * @param dto el DTO establecido para la creacion de un comentario
     * @returns Promesa de la creacion del comentario
     */
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

    /**
     * Obtiene todos los comentarios de una review
     * @param reviewId ID de la review cuyos comentarios se quieren obtener
     * @returns Promesa con los comentarios obtenidos
     */
    async findByReview(reviewId: number, page = 0) {
        const limit = 10;
        const offset = page * limit;

        const review = await this.reviewsRepo.findOneBy({ id: reviewId });
        
        if (!review) {
            throw new NotFoundException('No se encontro una review con este id.')
        }

        const comentarios = await this.comentariosRepo.find({
            where: {
                review: { id: reviewId }
            },
            skip: offset,
            take: limit,
            relations: ['user'],
        });
        
        if (!comentarios || comentarios.length === 0) {
            throw new NotFoundException('No se encontraron comentarios para esta review.')
        }

        return comentarios;
    }

    /**
     * Borra un comentario
     * @param comentarioId ID del comentario a borrar 
     * @param userId ID del usuario que borra un comentario
     * @returns Confirmacion de la eliminacion del comentario
     */
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