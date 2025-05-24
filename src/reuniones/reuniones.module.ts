import { Module } from "@nestjs/common";
import { ReunionService } from "./services/reunion.service";
import { ReunionController } from "./controllers/reunion.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Grupo } from "src/grupos/entities/grupo.entity";
import { User } from "src/users/entities/user.entity";
import { Reunion } from "./entities/reunion.entity";
import { UsersModule } from "src/users/users.module";
import { GrupoModule } from "src/grupos/grupo.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Grupo, User, Reunion]),
        UsersModule,
        GrupoModule,
    ],
    providers: [ReunionService],
    controllers: [ReunionController]
})
export class ReunionModule {}