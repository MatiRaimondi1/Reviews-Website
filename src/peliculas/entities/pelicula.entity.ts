import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pelicula {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    sinopsis: string;

    @Column()
    genero: string;

    @Column({ type: 'date' })
    fechaEstreno: Date;

    @Column()
    duracion: number;

    @Column()
    urlImagen: string;

    @Column()
    calificacion: number;
}