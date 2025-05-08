import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm";

@Entity()
@Unique(['user', 'pelicula'])
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
}