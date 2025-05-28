
import { Test, TestingModule } from '@nestjs/testing';
import { PeliculasService } from './peliculas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pelicula } from '../entities/pelicula.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
});

describe('PeliculasService', () => {
    let service: PeliculasService;
    let repo: jest.Mocked<Repository<Pelicula>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PeliculasService,
                {
                    provide: getRepositoryToken(Pelicula),
                    useFactory: mockRepo,
                },
            ],
        }).compile();

        service = module.get<PeliculasService>(PeliculasService);
        repo = module.get(getRepositoryToken(Pelicula));
    });

    it('findAll debe devolver 10 películas por defecto', async () => {
        const result = [{ id: 1, nombre: 'Test Movie' }];
        repo.find.mockResolvedValue(result as any);

        const response = await service.findAll();
        expect(repo.find).toHaveBeenCalledWith({ skip: 0, take: 10 });
        expect(response).toEqual(result);
    });

    it('findOne debe retornar una película por ID', async () => {
        const pelicula = { id: 1, nombre: 'Matrix' };
        repo.findOneBy.mockResolvedValue(pelicula as any);

        const result = await service.findOne(1);
        expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual(pelicula);
    });

    it('create debe guardar una nueva película', async () => {
        const dto = {
            nombre: 'Nueva',
            sinopsis: 'Sinopsis',
            genero: 'Drama',
            fechaEstreno: new Date(),
            duracion: 120,
            calificacion: 4.5,
        };
        const urlImagen = 'imagen.jpg'
        const dataConImagen = { ...dto, urlImagen };
        const pelicula = { id: 1, ...dataConImagen };

        repo.create.mockReturnValue(pelicula as any);
        repo.save.mockResolvedValue(pelicula as any);

        const result = await service.create(dto, urlImagen);
        expect(repo.create).toHaveBeenCalledWith(dataConImagen);
        expect(repo.save).toHaveBeenCalledWith(pelicula);
        expect(result).toEqual(pelicula);
    });

    it('update debe lanzar excepción si no encuentra la película', async () => {
        repo.findOneBy.mockResolvedValue(null);

        await expect(service.update(1, { nombre: 'Nueva' })).rejects.toThrow(NotFoundException);
    });

    it('delete debe llamar al repositorio para eliminar la película', async () => {
        repo.delete.mockResolvedValue({ affected: 1 } as any);

        const result = await service.delete(1);
        expect(repo.delete).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });
});