import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

/**
 * Servicio encargado de gestionar las operaciones relacionadas con las películas.
 */
@Injectable()
export class UsersService {

  /**
   * Inyecta el repositorio de usuarios
   * @param userRepo Repositorio de la entidad "Usuarios"
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Crea un usuario
   * @param createUserDto el DTO definido para la creacion de un usuario
   * @returns Promesa con la creacion del nuevo usuario
   */
  async create(createUserDto: CreateUserDto) {
    return this.userRepo.save(createUserDto);
  }

  /**
   * Busca un usuario por us email
   * @param email Email del usuario a buscar
   * @returns Promesa con el usuario encontrado o 'null' si no se encuentra
   */
  async findOneByEmail(email: string) {
    return this.userRepo.findOneBy({ email });
  }

  /**
   * Obtiene a todos los usuarios
   * @returns Promesa con todos los usuarios
   */
  async findAll() {
    return this.userRepo.find();
  }

  /**
   * Busca a un usuario en especifico mediante su ID
   * @param id ID del usuario a buscar
   * @returns Promesa con el usuario encontrado o 'null' si no se encuentra
   */
  async findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }
}
