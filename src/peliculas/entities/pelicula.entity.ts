import { Review } from 'src/reviews/entities/review.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Pelicula {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    nombre: string;

    @Column({ nullable: false })
    sinopsis: string;

    @Column({ nullable: false })
    genero: string;

    @Column({ type: 'date', nullable: false })
    fechaEstreno: Date;

    @Column({ nullable: false })
    duracion: number;

    @Column({ nullable: true })
    urlImagen?: string;

    @Column({ nullable: false })
    calificacion: number;

    @OneToMany(() => Review, review => review.pelicula)
    reviews: Review[];
}