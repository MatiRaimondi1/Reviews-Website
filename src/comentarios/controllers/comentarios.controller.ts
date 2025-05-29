import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { ComentariosService } from "../services/comentarios.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Role('user', 'admin')
@Controller('api/comentarios')
export class ComentariosController {
    constructor (private readonly comentariosService: ComentariosService) {}

    @Post(':reviewId')
    create(@Param('reviewId') reviewId: number, @Body() dto: CreateComentarioDto, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.create(reviewId, userId, dto);
    }

    @Get(':reviewId')
    async findByReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.comentariosService.findByReview(reviewId);
    }

    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.remove(id, userId);
    }
}