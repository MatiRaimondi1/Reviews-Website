
import { Test, TestingModule } from '@nestjs/testing';
import { PeliculasService } from './peliculas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pelicula } from '../entities/pelicula.entity';
import { ILike, Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
    it('si findAll no encuentra nada, debe arrojar un NotFoundException', () => {
        expect(service.findAll()).rejects.toThrow(NotFoundException);
    })

    it('findOne debe retornar una película por ID', async () => {
        const pelicula = { id: 1, nombre: 'Matrix' };
        repo.findOneBy.mockResolvedValue(pelicula as any);

        const result = await service.findOne(1);
        expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual(pelicula);
    });
    it('si findOne no encuentra la pelicula debe arrojar NotFoundException', () => {
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
    it('si la pelicula ya existe, debe arrojar ConflictException', () => {
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
    it('si no se encuentra una pelicula para eliminar, debe lanzar NotFoundException', () => {
        repo.delete.mockResolvedValue({ affected: 0 } as any)
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
            take: 10,
        });
        expect(result).toEqual(mockPeliculas);
    });
    it('si no se encontraron peliculas, deberia lanzar NotFoundException', () => {
        expect(service.findByKey('bat')).rejects.toThrow(NotFoundException)
    })

    it('debería devolver todas las películas que coincidan con la clave', async () => {
        const mockPeliculas = [
            { id: 1, nombre: 'Batman' },
            { id: 2, nombre: 'Batalla naval' },
        ] as Pelicula[];

        repo.find.mockResolvedValue(mockPeliculas);

        const result = await service.findAllByKey('bat', 0);

        expect(repo.find).toHaveBeenCalledWith({
            where: {
                nombre: ILike(`%bat%`),
            },
            order: { nombre: 'ASC' },
            skip: 0,
            take: 10,
        });
        expect(result).toEqual(mockPeliculas);
    });
    it('si no se encontraron peliculas, deberia lanzar NotFoundException', () => {
        expect(service.findAllByKey('bat', 2)).rejects.toThrow(NotFoundException)
    })

    it('debería lanzar BadRequest si el nombre del género está vacío', async () => {
        await expect(service.findByGenero('')).rejects.toThrow(BadRequestException);
        await expect(service.findByGenero('   ')).rejects.toThrow(BadRequestException);
        await expect(service.findByGenero(null as any)).rejects.toThrow(BadRequestException);
    });

    it('debería retornar películas si se encuentra por género con orden alfabético', async () => {
        const mockPeliculas = [{ id: 1, nombre: 'Test', calificacion: 7 }] as any;
        repo.find.mockResolvedValue(mockPeliculas);

        const result = await service.findByGenero('Drama', 0, 'asc');
        expect(result).toEqual(mockPeliculas);
        expect(repo.find).toHaveBeenCalledWith({
            where: { genero: { nombre: 'Drama' } },
            order: { nombre: 'ASC' },
            skip: 0,
            take: 10,
        });
    });

    it('debería retornar películas ordenadas por calificación descendente', async () => {
        const mockPeliculas = [{ id: 1, nombre: 'Test', calificacion: 9 }] as any;
        repo.find.mockResolvedValue(mockPeliculas);

        const result = await service.findByGenero('Comedia', 1, undefined, 'desc');
        expect(result).toEqual(mockPeliculas);
        expect(repo.find).toHaveBeenCalledWith({
            where: { genero: { nombre: 'Comedia' } },
            order: { calificacion: 'DESC' },
            skip: 10,
            take: 10,
        });
    });

    it('debería lanzar NotFoundException si no hay resultados', async () => {
        repo.find.mockResolvedValue([]);

        await expect(service.findByGenero('Acción')).rejects.toThrow(NotFoundException);
    });

    it('debería actualizar película sin cambiar género si no viene género en el body', async () => {
        const peliculaExistente = { id: 1, nombre: 'Original', genero: { id: 1, nombre: 'Drama' } } as Pelicula;
        repo.findOne.mockResolvedValue(peliculaExistente);
        repo.save.mockResolvedValue({ ...peliculaExistente, nombre: 'Actualizada' });

        const result = await service.update(1, { nombre: 'Actualizada' } as any);

        expect(repo.merge).toHaveBeenCalledWith(peliculaExistente, {
            nombre: 'Actualizada',
            genero: undefined,
        });
        expect(repo.save).toHaveBeenCalledWith(peliculaExistente);
        expect(result).toEqual({ ...peliculaExistente, nombre: 'Actualizada' });
    });

    it('debería crear un género nuevo si no existe y asignarlo a la película', async () => {
        const peliculaExistente = { id: 1, nombre: 'Original' } as Pelicula;
        repo.findOne.mockResolvedValue(peliculaExistente);
        generoRepo.findOneBy.mockResolvedValue(null);
        generoRepo.create.mockReturnValue({ nombre: 'Ciencia Ficción' } as Genero);
        generoRepo.save.mockResolvedValue({ id: 2, nombre: 'Ciencia Ficción' } as Genero);
        repo.save.mockResolvedValue({ ...peliculaExistente, nombre: 'Original', genero: { id: 2, nombre: 'Ciencia Ficción' } as Genero });

        const result = await service.update(1, { nombre: 'Original', genero: 'Ciencia Ficción' } as any);

        expect(generoRepo.create).toHaveBeenCalledWith({ nombre: 'Ciencia Ficción' });
        expect(generoRepo.save).toHaveBeenCalled();
        expect(repo.merge).toHaveBeenCalledWith(peliculaExistente, {
            nombre: 'Original',
            genero: { id: 2, nombre: 'Ciencia Ficción' },
        });
        expect(result.genero.nombre).toEqual('Ciencia Ficción');
    });

    it('debería asignar un género existente si existe en la base de datos', async () => {
        const peliculaExistente = { id: 1, nombre: 'Original' } as Pelicula;
        const generoExistente = { id: 3, nombre: 'Accion' } as Genero;
        repo.findOne.mockResolvedValue(peliculaExistente);
        generoRepo.findOneBy.mockResolvedValue(generoExistente);
        repo.save.mockResolvedValue({ ...peliculaExistente, genero: generoExistente });

        const result = await service.update(1, { nombre: 'Original', genero: 'Accion' } as any);

        expect(generoRepo.findOneBy).toHaveBeenCalledWith({ nombre: 'Accion' });
        expect(repo.merge).toHaveBeenCalledWith(peliculaExistente, {
            nombre: 'Original',
            genero: generoExistente,
        });
        expect(result.genero).toEqual(generoExistente);
    });

    it('debería lanzar BadRequestException si nombreGenero es vacío', async () => {
        await expect(service.findByGeneroByKey('', 'algo')).rejects.toThrow(BadRequestException);
        await expect(service.findByGeneroByKey('  ', 'algo')).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si no hay películas para el género y clave dados', async () => {
        repo.find.mockResolvedValue([]);
        await expect(service.findByGeneroByKey('Accion', 'Matrix')).rejects.toThrow(NotFoundException);
    });

    it('debería retornar las películas encontradas para el género y clave dados', async () => {
        const resultadoMock = [{ id: 1, nombre: 'Matrix', genero: { nombre: 'Accion' } }] as Pelicula[];
        repo.find.mockResolvedValue(resultadoMock);

        const result = await service.findByGeneroByKey('Accion', 'Matrix');
        expect(result).toEqual(resultadoMock);
        expect(repo.find).toHaveBeenCalledWith({
            where: {
                genero: {
                    nombre: 'Accion',
                },
                nombre: expect.any(Object),
            },
            order: expect.any(Object),
            skip: 0,
            take: 10,
        });
    });
});