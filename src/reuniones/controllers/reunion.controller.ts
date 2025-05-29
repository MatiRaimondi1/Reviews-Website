import { Body, Request, Controller, Post, UseGuards, Delete, Param, ParseIntPipe, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ReunionService } from "../services/reunion.service";
import { CreateReunionDto } from "../dto/create-reunion.dto";

/**
 * Controlador encargado de manejar las requests relativas a las reuniones
 */
@Controller('api/reuniones')
@UseGuards(JwtAuthGuard)
export class ReunionController {
    /**
     * Inyecta el servicio de reuniones
     * @param reunionService Servicio con la logica de negocio de Reuniones
     */
    constructor(private readonly reunionService: ReunionService) {}

    /**
     * Crea una reunion
     * @param dto el DTO definido para la creacion de una reunion
     * @param req el objeto de la request de HTML
     * @returns La reunion creada
     */
    @Post()
    async createReunion(@Body() dto: CreateReunionDto, @Request() req) {
        const userId = req.user['id'];
        return this.reunionService.create(userId, dto);
    }

    /**
     * Borra una reunion
     * @param req el objeto de la request de HTML
     * @returns Mensaje con la confirmacion de la eliminacion de la reunion
     */
    @Delete()
    async deleteReunion(@Request() req) {
        const userId = req.user['id'];
        return this.reunionService.delete(userId)
    }

    /**
     * Obtiene una reunion en base a la ID de su grpo
     * @param id ID del grupo cuya reunion se quiere obtener
     * @param req el objeto de la request de HTML
     * @returns La reunion encontrada, si se encuentra
     */
    @Get()
    async getReunion(@Request() req) {
        const userId = req.user['id'];
        return this.reunionService.getReunion(userId);
    }

}