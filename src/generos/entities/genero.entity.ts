import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Genero {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    nombre: string;

    @OneToMany(() => Pelicula, pelicula => pelicula.genero)
    @JoinColumn()
    peliculas: Pelicula[];
}