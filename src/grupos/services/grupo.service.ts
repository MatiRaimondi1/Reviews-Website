import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { User } from 'src/users/entities/user.entity';
import { MembresiaGrupo } from '../entities/membresiaGrupo.entity';

@Injectable()
export class GrupoService {

  /**
   * Inyecta los repositorios
   * @param grupoRepo Repositorio de los Grupos
   * @param userRepo Repositorio de los Users
   * @param membresiaGrupoRepo Relacion entre los Users y los Grupos
   */
  constructor(
    @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(MembresiaGrupo) private membresiaGrupoRepo: Repository<MembresiaGrupo>,
  ) {}

  /**
   * Logica para la creacion de un grupo
   * @param nombre Nombre del Grupo
   * @param userId ID del creador del grupo, quien automaticamente se convierte en lider
   * @param descripcion Descripcion del grupo
   * @returns Promesa con la creacion del grupo
   */
  async create(nombre: string, userId: number, descripcion?: string) {
  const user = await this.userRepo.findOneByOrFail({ id: userId });

  const grupo = this.grupoRepo.create({ nombre, descripcion });
  await this.grupoRepo.save(grupo);

  const relacion = this.membresiaGrupoRepo.create({
    user: user,
    grupo,
    rol: 'lider',
  });

  await this.membresiaGrupoRepo.save(relacion);

  return grupo;
}

/**
 * Logica para unir a un miembro a un grupo
 * @param grupoId ID del grupo al cual se une el usuario
 * @param userId ID del usuario que se quiere unir al grupo
 * @returns Mensaje de confirmacion de unirse al grupo, en caso de que el proceso no falle
 */
async join(grupoId: number, userId: number) {
  const grupo = await this.grupoRepo.findOneByOrFail({ id: grupoId });
  const user = await this.userRepo.findOneByOrFail({ id: userId });

  const existe = await this.membresiaGrupoRepo.findOne({
    where: { grupo: { id: grupoId }, user: { id: userId } },
  });

  if (existe) throw new BadRequestException('Ya eres miembro de este grupo');

  const relacion = this.membresiaGrupoRepo.create({
    grupo,
    user: user,
    rol: 'miembro',
  });

  await this.membresiaGrupoRepo.save(relacion);

  return { mensaje: 'Te uniste al grupo correctamente' };
}

/**
 * Obtiene todos los grupos
 * @returns Promesa con todos los grupos
 */
async getAll() {
  return this.grupoRepo.find();
}

/**
 * Logica para obtener todos los miembros de un grupo en especifico
 * @param grupoId ID del grupo cuyos miembros se quieren obtener
 * @returns Lista de todos los usuarios de un grupo junto con su rol en el mismo
 */
async getMembers(grupoId: number) {
  const grupo = await this.grupoRepo.findOne({
    where: { id: grupoId },
    relations: ['usuariosRelacionados', 'usuariosRelacionados.user'],
  });

  if (!grupo) throw new NotFoundException('Grupo no encontrado');

  return grupo.usuariosRelacionados.map((relacion) => ({
    id: relacion.user.id,
    nombre: relacion.user.username,
    rol: relacion.rol,
  }));
}
}
