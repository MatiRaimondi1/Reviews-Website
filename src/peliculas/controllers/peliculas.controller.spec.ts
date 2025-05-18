import { Test, TestingModule } from '@nestjs/testing';
import { PeliculasController } from '../controllers/peliculas.controller';
import { PeliculasService } from '../services/peliculas.service';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';

describe('PeliculasController', () => {
    let controller: PeliculasController;
    let service: PeliculasService;

    const mockPeliculasService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PeliculasController],
            providers: [
                { provide: PeliculasService, useValue: mockPeliculasService },
            ],
        }).compile();

        controller = module.get<PeliculasController>(PeliculasController);
        service = module.get<PeliculasService>(PeliculasService);

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('debe llamar a findAll con el parámetro page y devolver resultado', async () => {
            const result = [{ id: 1, nombre: 'Test Movie' }];
            mockPeliculasService.findAll.mockResolvedValue(result);

            const response = await controller.findAll(2);

            expect(mockPeliculasService.findAll).toHaveBeenCalledWith(2);
            expect(response).toEqual(result);
        });

        it('debe llamar a findAll con page 0 por defecto si no se pasa parámetro', async () => {
            const result = [{ id: 2, nombre: 'Otra' }];
            mockPeliculasService.findAll.mockResolvedValue(result);

            const response = await controller.findAll(undefined);

            expect(mockPeliculasService.findAll).toHaveBeenCalledWith(0);
            expect(response).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('debe llamar a findOne con el id y devolver resultado', async () => {
            const pelicula = { id: 1, nombre: 'Matrix' };
            mockPeliculasService.findOne.mockResolvedValue(pelicula);

            const response = await controller.findOne(1);

            expect(mockPeliculasService.findOne).toHaveBeenCalledWith(1);
            expect(response).toEqual(pelicula);
        });
    });

    describe('create', () => {
        it('debe llamar a create con el dto y devolver resultado', async () => {
            const dto: CreatePeliculaDto = {
                nombre: 'Nueva Película',
                sinopsis: 'Una sinopsis',
                genero: 'Drama',
                fechaEstreno: new Date(),
                duracion: 120,
                urlImagen: 'url.jpg',
                calificacion: 4.5,
            };

            const created = { id: 1, ...dto };
            mockPeliculasService.create.mockResolvedValue(created);

            const response = await controller.create(dto);

            expect(mockPeliculasService.create).toHaveBeenCalledWith(dto);
            expect(response).toEqual(created);
        });
    });

    describe('delete', () => {
        it('debe llamar a delete con el id y devolver true', async () => {
            mockPeliculasService.delete.mockResolvedValue(true);

            const response = await controller.delete(1);

            expect(mockPeliculasService.delete).toHaveBeenCalledWith(1);
            expect(response).toBe(true);
        });
    });
});
