import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Grupo } from "./entities/grupo.entity";
import { MembresiaGrupo } from "./entities/membresiaGrupo.entity";
import { User } from "src/users/entities/user.entity";
import { GrupoController } from "./controllers/grupo.controller";
import { GrupoService } from "./services/grupo.service";
import { Reunion } from "src/reuniones/entities/reunion.entity";

/**
 * Encapsula los providers de la entidad Grupo, y define que partes 
 * pueden importarse en otros modulos
 */
@Module({
    imports: [TypeOrmModule.forFeature([Grupo, MembresiaGrupo, User, Reunion])],
    controllers: [GrupoController],
    providers: [GrupoService],
})
export class GrupoModule {}