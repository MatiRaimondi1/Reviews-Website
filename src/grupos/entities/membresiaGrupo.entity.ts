import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Grupo } from "./grupo.entity";

@Entity()
@Unique(['user', 'grupo'])
export class MembresiaGrupo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.gruposRelacionados)
    user: User;

    @ManyToOne(() => Grupo, (grupo) => grupo.usuariosRelacionados)
    grupo: Grupo;

    @Column({ default: 'miembro' })
    rol: 'miembro' | 'lider';
}