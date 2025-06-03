import { createQueryBuilder, Repository } from "typeorm";
import { ReviewsService } from "./reviews.service";
import { Review } from "../entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Pelicula } from "src/peliculas/entities/pelicula.entity";
import { Grupo } from "src/grupos/entities/grupo.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

const mockRepoReviews = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    getOne: jest.fn(),
})

const mockRepoUsers = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
})

const mockRepoPeliculas = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
})

const mockRepoGrupos = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
})

describe('reviewsService', () => {
    let service: ReviewsService
    let repoReviews: jest.Mocked<Repository<Review>>
    let repoUsers: jest.Mocked<Repository<User>>
    let repoPeliculas: jest.Mocked<Repository<Pelicula>>
    let repoGrupos: jest.Mocked<Repository<Grupo>>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                {
                    provide: getRepositoryToken(Review),
                    useFactory: mockRepoReviews,
                },
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepoUsers,
                },
                {
                    provide: getRepositoryToken(Pelicula),
                    useFactory: mockRepoPeliculas,
                },
                {
                    provide: getRepositoryToken(Grupo),
                    useFactory: mockRepoGrupos,
                },
            ]
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        repoReviews = module.get(getRepositoryToken(Review));
        repoUsers = module.get(getRepositoryToken(User));
        repoPeliculas = module.get(getRepositoryToken(Pelicula));
        repoGrupos = module.get(getRepositoryToken(Grupo));
    });

    it('crear una review individual', async () => {
        const dto = {
            texto: 'ejemplo',
            puntuacion: 5,
        };
        const dtoUser = {
            username: 'Pablo',
            email: 'pablo@ejemplo.com',
            password: 'contrasenia',
        };
        const dtoPelicula = {
            nombre: 'Nueva Película',
            sinopsis: 'Una sinopsis',
            genero: 'Drama',
            fechaEstreno: new Date(),
            duracion: 120,
            calificacion: 4.5,
        }

        const mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
        };

        repoReviews.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const user = { id: 2, ...dtoUser };
        const pelicula = { id: 3, ...dtoPelicula };
        const review = { id: 1, ...dto, user, pelicula };
        repoUsers.findOneBy.mockResolvedValue(user as any);
        repoPeliculas.findOneBy.mockResolvedValue(pelicula as any);

        repoReviews.create.mockReturnValue(review as any)
        repoReviews.save.mockResolvedValue(review as any);

        const result = await service.create(dto, 2, 3);

        expect(repoUsers.findOneBy).toHaveBeenCalledWith({ id: 2 });
        expect(repoPeliculas.findOneBy).toHaveBeenCalledWith({ id: 3 });
        expect(repoReviews.create).toHaveBeenCalledWith({ ...dto, user, pelicula })
        expect(repoReviews.save).toHaveBeenCalledWith(review);
        expect(result).toEqual(result);
    })

    it('crear una review grupal', async () => {
        const dto = {
            texto: 'ejemplo',
            puntuacion: 5,
        };
        const dtoUser = {
            username: 'Pablo',
            email: 'pablo@ejemplo.com',
            password: 'contrasenia',
        };
        const dtoPelicula = {
            nombre: 'Nueva Película',
            sinopsis: 'Una sinopsis',
            genero: 'Drama',
            fechaEstreno: new Date(),
            duracion: 120,
            calificacion: 4.5,
        }
        const dtoGrupo = {
            nombre: 'grupo',
            descripcion: 'lorem ipsum',
            usuariosRelacionados: [{
                user: { id: 2 },
                rol: 'lider',
            }]
        }

        const mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
        };

        repoReviews.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const user = { id: 2, ...dtoUser, rol: 'lider' };
        const pelicula = { id: 3, ...dtoPelicula };
        const grupo = { id: 4, ...dtoGrupo };
        const review = { id: 1, ...dto, user, pelicula };
        repoUsers.findOneBy.mockResolvedValue(user as any);
        repoPeliculas.findOneBy.mockResolvedValue(pelicula as any);
        repoGrupos.findOne.mockResolvedValue(grupo as any);

        repoReviews.create.mockReturnValue(review as any)
        repoReviews.save.mockResolvedValue(review as any);

        const result = await service.create(dto, 2, 3, 4);

        expect(repoUsers.findOneBy).toHaveBeenCalledWith({ id: 2 });
        expect(repoPeliculas.findOneBy).toHaveBeenCalledWith({ id: 3 });
        expect(repoGrupos.findOne).toHaveBeenCalledWith({
            where: { id: 4 },
            relations: ['usuariosRelacionados', 'usuariosRelacionados.user']
        });
        expect(repoReviews.create).toHaveBeenCalledWith({ ...dto, user, pelicula, grupo })
        expect(repoReviews.save).toHaveBeenCalledWith(review);
        expect(result).toEqual(result);
    })

    it('debe encontrar las reviews relativas a una pelicula en particular', async () => {
        const review = [{ id: 1, texto: 'ejemplo', puntuacion: 5, peliculaId: 2, user: { id: 3, username: 'pablo' } }]
        repoReviews.find.mockResolvedValue(review as any)

        const result = await service.findByPelicula(2);

        expect(repoReviews.find).toHaveBeenCalledWith({
            where: {
                pelicula: { id: 2 }
            },
            relations: ['user']
        });
        expect(result).toEqual(review);
    })

    it('debe un usuario poder eliminar su propia review', async () => {
        const dto = { texto: 'ejemplo', puntuacion: 5 }
        const dtoUser = { username: 'Pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', };

        const user = { id: 2, ...dtoUser, rol: 'usuario' };
        const review = { id: 1, ...dto, user };

        repoReviews.findOne.mockResolvedValue(review as any)
        repoUsers.findOneBy.mockResolvedValue(user as any);

        repoReviews.remove.mockResolvedValue(review as any);

        await service.delete(1, 2);
        expect(repoReviews.remove).toHaveBeenCalledWith(review);
    })

    it('debe un admin poder elminar cualquier review', async () => {
        const dto = { texto: 'ejemplo', puntuacion: 5 }
        const dtoUser = { username: 'Pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', };
        const dtoAdmin = { username: 'Pablont', email: 'adminmuyserio@ejemplo.com', password: 'contraseniant' };

        const user = { id: 2, ...dtoUser, rol: 'usuario' };
        const admin = { id: 3, ...dtoUser, rol: 'admin' }
        const review = { id: 1, ...dto, user };

        repoReviews.findOne.mockResolvedValue(review as any)
        repoUsers.findOneBy.mockResolvedValue(admin as any);

        repoReviews.remove.mockResolvedValue(review as any);

        await service.delete(1, 3);
        expect(repoReviews.remove).toHaveBeenCalledWith(review);
    })

    it('debería retornar todas las reviews del usuario si existen', async () => {
        const fakeReviews = [
            {
                id: 1,
                texto: 'Buena',
                puntuacion: 4,
                userId: 1,
                peliculaId: 1,
                pelicula: { id: 1, nombre: 'Matrix' },
                user: { id: 1, username: 'testuser' },
                comentarios: [],
            },
            {
                id: 2,
                texto: 'Excelente',
                puntuacion: 5,
                userId: 1,
                peliculaId: 2,
                pelicula: { id: 2, nombre: 'Inception' },
                user: { id: 1, username: 'testuser' },
                comentarios: [],
            },
        ] as unknown as Review[];

        repoReviews.find.mockResolvedValue(fakeReviews);

        const result = await service.findByUsuario(1);

        expect(result).toEqual(fakeReviews);
        expect(repoReviews.find).toHaveBeenCalledWith({
            where: { user: { id: 1 } },
            relations: ['pelicula'],
            order: { id: 'DESC' },
        });
    });

    it('debería retornar la cantidad de reviews del usuario si existen', async () => {
        const mockReviews = [
            { id: 1, user: { id: 1 }, pelicula: {}, texto: 'Review 1' },
            { id: 2, user: { id: 1 }, pelicula: {}, texto: 'Review 2' },
        ] as Review[];

        repoReviews.find.mockResolvedValue(mockReviews);

        const count = await service.countByUsuario(1);

        expect(count).toBe(2);
        expect(repoReviews.find).toHaveBeenCalledWith({
            where: { user: { id: 1 } },
            relations: ['pelicula'],
            order: { id: 'DESC' },
        });
    });
})