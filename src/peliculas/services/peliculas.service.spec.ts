
import { Test, TestingModule } from '@nestjs/testing';
import { PeliculasService } from './peliculas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pelicula } from '../entities/pelicula.entity';
import { ILike, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Genero } from 'src/generos/entities/genero.entity';

const mockRepo = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
});

describe('PeliculasService', () => {
    let service: PeliculasService;
    let repo: jest.Mocked<Repository<Pelicula>>;
    let generoRepo: jest.Mocked<Repository<Genero>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PeliculasService,
                {
                    provide: getRepositoryToken(Pelicula),
                    useFactory: mockRepo,
                },
                {
                    provide: getRepositoryToken(Genero),
                    useFactory: mockRepo,
                }
            ],
        }).compile();

        service = module.get<PeliculasService>(PeliculasService);
        repo = module.get(getRepositoryToken(Pelicula));
        generoRepo = module.get(getRepositoryToken(Genero));
    });

    it('findAll debe devolver 10 películas por defecto', async () => {
        const result = [{ id: 1, nombre: 'Test Movie' }];
        repo.find.mockResolvedValue(result as any);

        const response = await service.findAll();
        expect(repo.find).toHaveBeenCalledWith({ order: { nombre: 'ASC' }, skip: 0, take: 10 });
        expect(response).toEqual(result);
    });
    it('si findAll no encuentra nada, debe arrojar un NotFoundException', () =>{
        expect(service.findAll()).rejects.toThrow(NotFoundException);
    })

    it('findOne debe retornar una película por ID', async () => {
        const pelicula = { id: 1, nombre: 'Matrix' };
        repo.findOneBy.mockResolvedValue(pelicula as any);

        const result = await service.findOne(1);
        expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual(pelicula);
    });
    it('si findOne no encuentra la pelicula debe arrojar NotFoundException', ()=>{
        expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    })

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
        const generoEntity = { id: 2, nombre: 'Drama' };
        const expectedPelicula = {
            id: 1,
            ...dto,
            urlImagen,
            genero: generoEntity,
        };

        repo.findOne.mockResolvedValue(null);
        generoRepo.findOne.mockResolvedValue(generoEntity as Genero)
        repo.create.mockReturnValue(expectedPelicula as any);
        repo.save.mockResolvedValue(expectedPelicula as any);

        const result = await service.create(dto, urlImagen);

        expect(repo.findOne).toHaveBeenCalledWith({ where: { nombre: dto.nombre } });
        expect(generoRepo.findOne).toHaveBeenCalledWith({ where: { nombre: dto.genero.trim() } });
        expect(repo.create).toHaveBeenCalledWith({
            ...dto,
            genero: generoEntity,
            urlImagen,
        });
        expect(repo.save).toHaveBeenCalledWith(expectedPelicula);
        expect(result).toEqual(expectedPelicula);
    });
    it('si la pelicula ya existe, debe arrojar ConflictException', ()=>{
        const dto = {
            nombre: 'Nueva',
            sinopsis: 'Sinopsis',
            genero: 'Drama',
            fechaEstreno: new Date(),
            duracion: 120,
            calificacion: 4.5,
        };
        const urlImagen = 'imagen.jpg'
        const generoEntity = { id: 2, nombre: 'Drama' };
        const expectedPelicula = {
            id: 1,
            ...dto,
            urlImagen,
            genero: generoEntity,
        };
        repo.findOne.mockResolvedValue(expectedPelicula as any);

        expect(service.create(dto, urlImagen,)).rejects.toThrow(ConflictException)
    })

    it('update debe lanzar excepción si no encuentra la película', async () => {
        repo.findOneBy.mockResolvedValue(null);

        await expect(service.update(1, { nombre: 'Nueva' })).rejects.toThrow(NotFoundException);
    });

    it('delete debe llamar al repositorio para eliminar la película', async () => {
        repo.delete.mockResolvedValue({ affected: 1 } as any);

        const result = await service.delete(1);
        const expectedResult = { "message": "Película eliminada correctamente.", "success": true }
        expect(repo.delete).toHaveBeenCalledWith(1);
        expect(result).toStrictEqual(expectedResult);
    });
    it('si no se encuentra una pelicula para eliminar, debe lanzar NotFoundException', ()=>{
        repo.delete.mockResolvedValue({affected: 0} as any)
        expect(service.delete(1)).rejects.toThrow(NotFoundException);
    })

    it('debería devolver películas que coincidan con la clave', async () => {
        const mockPeliculas = [
            { id: 1, nombre: 'Batman' },
            { id: 2, nombre: 'Batalla naval' },
        ] as Pelicula[];

        repo.find.mockResolvedValue(mockPeliculas);

        const result = await service.findByKey('bat');

        expect(repo.find).toHaveBeenCalledWith({
            where: {
                nombre: ILike('%bat%'),
            },
            order: { nombre: 'ASC' },
        });
        expect(result).toEqual(mockPeliculas);
    });
    it('si no se encontraron peliculas, deberia lanzar NotFoundException', ()=>{
        expect(service.findByKey('bat')).rejects.toThrow(NotFoundException)
    })
});