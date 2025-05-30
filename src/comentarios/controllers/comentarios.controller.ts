import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { ComentariosService } from "../services/comentarios.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

/**
 * Controlador encargado de manejar las requests relativas a los comentarios
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('user', 'admin')
@Controller('api/comentarios')
export class ComentariosController {
    /**
     * Inyecta el servicio de los comentarios
     * @param comentariosService Servicio con la logica de negocio de los comentarios
     */
    constructor (private readonly comentariosService: ComentariosService) {}

    /**
     * Crea un comentario
     * @param reviewId ID de la review en la que se comenta
     * @param dto el DTO definido para la creacion de un comentario
     * @param req la request de HTTP
     * @returns El comentario creado
     */
    @Post(':reviewId')
    create(@Param('reviewId') reviewId: number, @Body() dto: CreateComentarioDto, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.create(reviewId, userId, dto);
    }

    /**
     * Obtiene todos los comentarios de una review
     * @param reviewId ID de la review cuyos comentarios se quieren obtener
     * @returns Promesa con los comentarios obtenidos
     */
    @Get(':reviewId')
    async findByReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.comentariosService.findByReview(reviewId);
    }

    /**
     * Borra un comentario
     * @param id ID del comentario a borrar
     * @param req la request de HTTP
     * @returns Mensaje de confirmacion de la eliminiacion
     */
    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.remove(id, userId);
    }
}