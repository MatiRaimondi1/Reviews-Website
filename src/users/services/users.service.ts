import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los usuarios
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
    ) { }

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
     * @returns Promesa con el usuario encontrado
     */
    async findOneByEmail(email: string) {
        return this.userRepo.findOneBy({ email });
    }

    /**
     * Busca un usuario por nombre de usuario
     * @param username Nombre del usuario a buscar
     * @returns Promesa con el usuario encontrado
     */
    async findOneByUsername(username: string) {
        return this.userRepo.findOneBy({ username })
    }

    /**
     * Obtiene a todos los usuarios
     * @returns Promesa con todos los usuarios
     */
    async findAll() {
        const usuarios = await this.userRepo.find()
        if (!usuarios || usuarios.length === 0) {
            throw new NotFoundException('No se encontraron usuarios.')
        }
        return usuarios;
    }

    /**
     * Busca a un usuario en especifico mediante su ID
     * @param id ID del usuario a buscar
     * @returns Promesa con el usuario encontrado
     */
    async findOne(id: number) {
        const usuario = await this.userRepo.findOneBy({ id });
        if (!usuario) {
            throw new NotFoundException('No se encontro un usuario con ese ID.')
        }
        return usuario;
    }

    /**
     * Cambia la imagen de perfil del usuario
     * 
     * @param userId ID del usuario
     * @param imageUrl URL de la imagen de perfil
     * @returns Mensaje de exito
     */
    async updateProfileImage(userId: number, imageUrl: string) {
        const result = await this.userRepo.update(userId, { urlImagen: imageUrl });
        if (result.affected === 0) {
            throw new NotFoundException("El usuario no fue encontrado.")
        }

        return { message: "Imagen de perfil cambiada correctamente." }
    }
}