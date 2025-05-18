import { Review } from "src/reviews/entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comentario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    texto: string;

    @Column()
    userId: number;

    @ManyToOne(() => User, user => user.comentarios, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    reviewId: number;

    @ManyToOne(() => Review, review => review.comentarios, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewId'})
    review: Review;
}