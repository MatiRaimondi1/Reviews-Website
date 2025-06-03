import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { ReviewsService } from "../services/reviews.service";
import { CreateReviewDto } from "../dto/create-review.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";

/**
 * Controlador encargado de manejar las requests relativas a las reviews
 */
@Controller('api/reviews')
export class ReviewsController {

    /**
    * Inyecta el servicio de Reviews
    * @param reviewsService Servicio que contiene la logica de negocio de Reviews
    */
    constructor(private readonly reviewsService: ReviewsService) { }

    /**
     * Crea una nueva review
     * 
     * @param peliculaId ID de la pelicula de la cual la review se trata
     * @param dto el DTO definido para la creacion de una review
     * @param req El objeto de la request de HTTP
     * @returns La nueva review
     */
    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Post(':peliculaId')
    create(
        @Param('peliculaId', ParseIntPipe) peliculaId: number,
        @Body() dto: CreateReviewDto,
        @Request() req
    ) {
        const userId = req.user.id;
        const grupoId = dto.grupoId;

        return this.reviewsService.create(dto, userId, peliculaId, grupoId);
    }

    /**
     * Obtiene una promesa con todas las reviews de una pelicula en especifico, junto con el usuario
     * que la publico, en base a la ID de la pelicula
     * 
     * @param peliculaId ID de la pelicula a buscar
     * @returns Promesa con las reviews
     */
    @Get(':peliculaId')
    findByPelicula(@Param('peliculaId', ParseIntPipe) peliculaId: number) {
        return this.reviewsService.findByPelicula(peliculaId);
    }

    /**
     * Obtiene todas las reviews de un usuario
     * 
     * @param userId ID del usuario a buscar
     * @returns Todas las reviews que hizo un usuario especifico
     */
    @Get('user/:userId')
    getReviewsByUsuario(@Param('userId', ParseIntPipe) userId: number) {
        return this.reviewsService.findByUsuario(userId);
    }

    /**
     * Obtiene la cantidad total de reviews que hizo un usuario
     * 
     * @param userId ID del usuario a buscar
     * @returns Cantidad total de reviews que hizo un usuario
     */
    @Get('user/:userId/count')
    async countReviewsByUsuario(@Param('userId', ParseIntPipe) userId: number) {
        return { cantidad: await this.reviewsService.countByUsuario(userId) };
    }

    /**
     * Borra una review
     * 
     * @param id ID de la review a borrar
     * @param req El objeto de la request de HTTP
     * @returns 'true' si la eliminacion fue exitosa
     */
    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const user = req.user.id;
        return this.reviewsService.delete(id, user);
    }
}