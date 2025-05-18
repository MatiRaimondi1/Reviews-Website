import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MembresiaGrupo } from "./membresiaGrupo.entity";
import { Review } from "src/reviews/entities/review.entity";

@Entity()
export class Grupo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;
    
    @Column({ nullable: true } )
    descripcion: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => MembresiaGrupo, (mg) => mg.grupo, { cascade: true})
    usuariosRelacionados: MembresiaGrupo[];

    @OneToMany(() => Review, review => review.grupo)
    reviews: Review[];
}