import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn } from "typeorm";

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

    @Column({ default: "./img/defaultUser.png" })
    urlImagen: string;

    @DeleteDateColumn()
    deletedAt: Date;
}
