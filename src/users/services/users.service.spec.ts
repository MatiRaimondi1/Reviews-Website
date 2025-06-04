import { Repository, UpdateResult } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "../entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from "@nestjs/common";

const mockRepo = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
});

describe('UsersService', () => {
    let service: UsersService
    let repo: jest.Mocked<Repository<User>>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepo,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repo = module.get(getRepositoryToken(User));
    });

    describe('findAll', () => {
        it('findAll debe devolver todos los usuarios', async () => {
            const result = [{ id: 1, nombre: 'Pablo' }];
            repo.find.mockResolvedValue(result as any);

            const response = await service.findAll();
            expect(response).toEqual(result);
        })

        it('si no hay usuarios, findAll debe tirar una excepcion', async () => {
            repo.find.mockResolvedValue([]);

            await expect(service.findAll()).rejects.toThrow(NotFoundException);
        })
    })

    it('findOne debe devolver un solo usuario basado en el ID', async () => {
        const result = [{ id: 1, nombre: 'Pablo' }];
        repo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findOne(1);
        expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(response).toEqual(result);
    })

    it('si el usuario no existe, findOne deberia lanzar NotFoundException', async () => {
        repo.findOneBy.mockResolvedValue(null);

        await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    })

    it('findOneByEmail debe devolver un solo usuario basado en el email', async () => {
        const result = [{ id: 1, nombre: 'Pablo', email: 'pablo@ejemplo.com' }];
        repo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findOneByEmail('pablo@ejemplo.com');
        expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'pablo@ejemplo.com' });
        expect(response).toEqual(result);
    })

    it('create debe guardar un nuevo usuario', async () => {
        const dto = {
            username: 'Pablo',
            email: 'pablo@ejemplo.com',
            password: 'contrasenia',
        };
        const result = { id: 1, ...dto };

        repo.save.mockResolvedValue(result as any);

        const response = await service.create(dto)
        expect(response).toEqual(result);
        expect(repo.save).toHaveBeenCalledWith(dto);
    })

    describe('updateProfileImage', () => {
        it('debería lanzar NotFoundException si no se encuentra el usuario', async () => {
            repo.update.mockResolvedValue({ affected: 0 } as UpdateResult);

            await expect(service.updateProfileImage(999, '/uploads/image.jpg')).rejects.toThrow(NotFoundException);
        });

        it('debería actualizar la imagen de perfil correctamente', async () => {
            repo.update.mockResolvedValue({ affected: 1 } as UpdateResult);

            const result = await service.updateProfileImage(1, '/uploads/user-123.jpg');

            expect(result).toEqual({ message: 'Imagen de perfil cambiada correctamente.' });
            expect(repo.update).toHaveBeenCalledWith(1, { urlImagen: '/uploads/user-123.jpg' });
        });
    });
})