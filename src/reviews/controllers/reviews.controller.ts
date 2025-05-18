import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { ReviewsService } from "../services/reviews.service";
import { CreateReviewDto } from "../dto/create-review.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "src/auth/decorators/role.decorator";

@Controller('api/reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

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

    @Get(':peliculaId')
    async findByPelicula(@Param('peliculaId', ParseIntPipe) peliculaId: number) {
        return this.reviewsService.findByPelicula(peliculaId);
    }

    @UseGuards(JwtAuthGuard)
    @Role('user', 'admin')
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const user = req.user.id;
        return this.reviewsService.delete(id, user);
    }
}