import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { User } from 'src/users/entities/user.entity';
import { MembresiaGrupo } from '../entities/membresiaGrupo.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo) private grupoRepo: Repository<Grupo>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(MembresiaGrupo) private membresiaGrupoRepo: Repository<MembresiaGrupo>,
  ) {}

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

async getAll() {
  return this.grupoRepo.find();
}

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
