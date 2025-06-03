import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { User } from 'src/users/entities/user.entity';
import { MembresiaGrupo } from '../entities/membresiaGrupo.entity';

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los grupos
 */
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
  ) { }

  /**
   * Logica para la creacion de un grupo
   * @param nombre Nombre del Grupo
   * @param userId ID del creador del grupo, quien automaticamente se convierte en lider
   * @param descripcion Descripcion del grupo
   * @returns Promesa con la creacion del grupo
   */
  async create(nombre: string, userId: number, descripcion?: string) {
    const user = await this.userExists(userId);
    await this.hasGroup(userId);
    await this.groupExists(nombre);

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
    const user = await this.userExists(userId);
    await this.hasGroup(userId);

    const grupo = await this.grupoRepo.findOneBy({ id: grupoId })
    if (!grupo) {
      throw new NotFoundException('No se encontró un grupo con ese id.')
    }

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
    const grupos = await this.grupoRepo.find();

    if (!grupos || grupos.length === 0) {
      throw new NotFoundException('No hay grupos registrados.');
    }

    return grupos;
  }

  /**
   * Obtiene un grupo con el id especificado
   * @param grupoId Id del grupo a buscar
   * @returns Promesa con el grupo con el id correspondiente.
   */
  async getOneById(grupoId: number) {
    const grupo = await this.grupoRepo.findOneBy({ id: grupoId })
    if (!grupo) {
      throw new NotFoundException("El grupo no existe.")
    }
    return grupo;
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

  /**
   * Logica para obtener la cantidad de miembros de un grupo
   * 
   * @param grupoId ID del grupo a buscar
   * @returns Cantidad de miembros dentro del grupo con el ID especificado
   */
  async countMembers(grupoId: number): Promise<number> {
    const grupo = await this.grupoRepo.findOne({
      where: { id: grupoId },
      relations: ['usuariosRelacionados'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    return grupo.usuariosRelacionados.length;
  }

  /**
  * Verifica si existe un usuario con el ID proporcionado.
  * 
  * @param userId - ID del usuario a verificar.
  * @returns El usuario encontrado.
  * @throws NotFoundException si no se encuentra un usuario con ese ID.
  */
  private async userExists(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('No se encontró un usuario con ese id.');
    }
    return user;
  }

  /**
  * Verifica si el usuario ya pertenece a algún grupo.
  * 
  * @param userId - ID del usuario a verificar.
  * @throws ConflictException si el usuario ya pertenece a un grupo.
  */
  private async hasGroup(userId: number) {
    const existingMembership = await this.membresiaGrupoRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (existingMembership) {
      throw new ConflictException('No puedes estar en más de un grupo.');
    }
  }

  /**
  * Verifica si ya existe un grupo con el nombre proporcionado.
  * 
  * @param nombre - Nombre del grupo a verificar.
  * @throws ConflictException si ya existe un grupo con ese nombre.
  */
  private async groupExists(nombre: string) {
    const existingGroup = await this.grupoRepo.findOneBy({ nombre });
    if (existingGroup) {
      throw new ConflictException('Ya existe un grupo con ese nombre.');
    }
  }
}