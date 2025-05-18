import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { CreateComentarioDto } from "../dto/create-comentario.dto";
import { ComentariosService } from "../services/comentarios.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";

@Controller('api/comentarios')
export class ComentariosController {
    constructor (private readonly comentariosService: ComentariosService) {}

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Post(':reviewId')
    create(@Param('reviewId') reviewId: number, @Body() dto: CreateComentarioDto, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.create(reviewId, userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Get(':reviewId')
    async findByReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.comentariosService.findByReview(reviewId);
    }

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const userId = req.user.id;
        return this.comentariosService.remove(id, userId);
    }
}