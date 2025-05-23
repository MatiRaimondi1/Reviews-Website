import { Grupo } from "src/grupos/entities/grupo.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reunion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    fecha: Date;

    @Column({ nullable: false })
    link: string;

    @Column()
    grupoId: number;

    @OneToOne(() => Grupo, grupo => grupo.reunion, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'grupoId' })
    grupo: Grupo;
}