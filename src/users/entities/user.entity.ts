import { Review } from "src/reviews/entities/review.entity";
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, OneToMany } from "typeorm";

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

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];

    @DeleteDateColumn()
    deletedAt: Date;
}
