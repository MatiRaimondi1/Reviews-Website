import { Body, Request, Controller, Post, UseGuards, Delete, Param, ParseIntPipe, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReunionService } from "../services/reunion.service";
import { CreateReunionDto } from "../dto/create-reunion.dto";

@Controller('api/reuniones')
@UseGuards(JwtAuthGuard)
export class ReunionController {
    constructor(private readonly reunionService: ReunionService) {}

    @Post()
    async createReunion(@Body() dto: CreateReunionDto, @Request() req) {
        const userId = req.user['id'];
        return this.reunionService.create(userId, dto);
    }

    @Delete(':id')
    async deleteReunion(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user['id'];
        return this.reunionService.delete(userId, id)
    }

    @Get(':id')
    async getReunion(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user['id'];
        return this.reunionService.getReunionByGrupo(userId, id);
    }

}