import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MembresiaGrupo } from "./membresiaGrupo.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Reunion } from "src/reuniones/entities/reunion.entity";

@Entity()
export class Grupo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;
    
    @Column({ nullable: true } )
    descripcion: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => MembresiaGrupo, (mg) => mg.grupo, { cascade: true})
    usuariosRelacionados: MembresiaGrupo[];

    @OneToMany(() => Review, review => review.grupo)
    reviews: Review[];

    @Column({ nullable: true })
    reunionId: number;

    @OneToOne(() => Reunion, reunion => reunion.grupo, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reunionId '})
    reunion: Reunion;
}