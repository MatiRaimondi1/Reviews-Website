import { Genero } from 'src/generos/entities/genero.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Pelicula {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    nombre: string;

    @Column({ nullable: false })
    sinopsis: string;

    @Column({ nullable: false })
    generoId: number;

    @ManyToOne(() => Genero, { cascade: true, eager: true, nullable: false })
    @JoinColumn({ name: 'generoId' })
    genero: Genero;

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