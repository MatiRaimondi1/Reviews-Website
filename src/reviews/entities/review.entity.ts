import { Comentario } from "src/comentarios/entities/comentario.entity";
import { Grupo } from "src/grupos/entities/grupo.entity";
import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToMany } from "typeorm";

@Index('IDX_review_individual', ['userId', 'peliculaId'], { unique: true, where: `"grupoId" IS NULL` })
@Index('IDX_review_grupal', ['grupo', 'pelicula'], { unique: true, where: `"grupoId" IS NOT NULL` })
@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    texto: string;

    @Column()
    puntuacion: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, user => user.reviews, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    peliculaId: number;

    @ManyToOne(() => Pelicula, pelicula => pelicula.reviews, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'peliculaId' })
    pelicula: Pelicula;

    @ManyToOne(() => Grupo, grupo => grupo.reviews, { nullable: true })
    grupo?: Grupo;

    @OneToMany(() => Comentario, comentario => comentario.review)
    comentarios: Comentario[];
}