import { Comentario } from "src/comentarios/entities/comentario.entity";
import { MembresiaGrupo } from "src/grupos/entities/membresiaGrupo.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, OneToMany, ManyToMany } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ default: 'user' })
    rol: string;

    @CreateDateColumn()
    fechaCreacion: Date;

    @Column({ default: 1 })
    nivel: number;

    @Column({ default: "/uploads/defaultUser.jpg" })
    urlImagen: string;

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];

    @DeleteDateColumn()
    deletedAt: Date | null;

    @OneToMany(() => MembresiaGrupo, (mg) => mg.user)
    gruposRelacionados: MembresiaGrupo[];

    @OneToMany(() => Comentario, comentario => comentario.review)
    comentarios: Comentario[];
}
