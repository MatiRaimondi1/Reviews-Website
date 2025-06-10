import { Review } from "src/reviews/entities/review.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Comentario } from "../entities/comentario.entity";
import { ComentariosService } from "./comentarios.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
})

describe('ComentariosService', () => {
    let service: ComentariosService;
    let repoComentarios: jest.Mocked<Repository<Comentario>>;
    let repoUsers: jest.Mocked<Repository<User>>;
    let repoReviews: jest.Mocked<Repository<Review>>;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers:[
                ComentariosService,
                {
                    provide: getRepositoryToken(Comentario),
                    useFactory: mockRepo,
                },
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepo,
                },
                {
                    provide: getRepositoryToken(Review),
                    useFactory: mockRepo,
                },
            ]
        }).compile();

        service = module.get<ComentariosService>(ComentariosService);
        repoComentarios = module.get(getRepositoryToken(Comentario));
        repoReviews = module.get(getRepositoryToken(Review));
        repoUsers = module.get(getRepositoryToken(User));
    });

    describe('create', () =>{
        it('debe crear un comentario', async () => {
            const dto = {texto: 'comentario'};
            const user = {id: 2, nombre: 'pablo'};
            const review = {id: 3};
            const comentario = {id: 1, ...dto};

            repoReviews.findOneBy.mockResolvedValue(review as any);
            repoUsers.findOneBy.mockResolvedValue(user as any);

            repoComentarios.create.mockReturnValue(comentario as any);
            repoComentarios.save.mockResolvedValue(comentario as any);

            const result = await service.create(3, 2, dto);

            expect(repoComentarios.create).toHaveBeenCalledWith({texto: 'comentario', user, review});
            expect(repoComentarios.save).toHaveBeenCalledWith(comentario);
            expect(result).toEqual(comentario);
        })
        it('si no existe la review o el usuario, debe lanzar NotFoundException', async ()=>{
            const dto = {texto: 'comentario'};
            await expect(service.create(1, 2, dto)).rejects.toThrow(NotFoundException)
        })
    })

    describe('findByReview', () =>{
        it('debe encontrar todos los comentarios relativos a una review', async () => {
            const comentario = {id: 1, texto: 'comentario'};
            const review = {id: 3};

            repoReviews.findOneBy.mockResolvedValue(review as any);
            repoComentarios.find.mockResolvedValue(comentario as any);

            const result = await service.findByReview(3);

            expect(repoComentarios.find).toHaveBeenCalledWith({where: {review: { id: 3 }}, skip: 0, take: 10 ,relations: ['user'],});
            expect(result).toEqual(comentario);
        })
        it('si no se encuentra la review especificada, debe lanzar NotFoundException', async () =>{
            await expect(service.findByReview(3)).rejects.toThrow(new NotFoundException('No se encontro una review con este id.'));
        })
        it('si la review no teiene comentarios, debe lanzar NotFoundException', async () =>{
            const review = {id: 3};
            repoReviews.findOneBy.mockResolvedValue(review as any);

            await expect(service.findByReview(3)).rejects.toThrow(new NotFoundException('No se encontraron comentarios para esta review.'));
        })
    })

    describe('remove', () =>{
        it('debe un usuario poder eliminar su propio comentario y enviar la confirmacion', async () =>{
            const user = {id: 2, nombre: 'pablo'};
            const comentario = {id: 1, texto: 'comentario', user: user};

            repoComentarios.findOne.mockResolvedValue(comentario as any);
            repoUsers.findOneBy.mockResolvedValue(user as any);
            repoComentarios.remove.mockResolvedValue(comentario as any)

            const result = await service.remove(1, 2);

            expect(repoComentarios.remove).toHaveBeenCalledWith(comentario);
            expect(result).toEqual({ success: true, message: 'Comentario eliminado correctamente.' });
        })
        it('debe un admin poder eliminar cualquier comentario y enviar la confirmacion', async () =>{
            const user = {id: 2, nombre: 'Pablo'};
            const admin = {id: 3, nombre: 'Omega Pablo', rol: 'admin'};
            const comentario = {id: 1, texto: 'comentario', user: user};

            repoComentarios.findOne.mockResolvedValue(comentario as any);
            repoUsers.findOneBy.mockResolvedValue(admin as any);
            repoComentarios.remove.mockResolvedValue(comentario as any)

            const result = await service.remove(1, 3);

            expect(repoComentarios.remove).toHaveBeenCalledWith(comentario);
            expect(result).toEqual({ success: true, message: 'Comentario eliminado correctamente.' });
        })
        it('Si no se encuentra el comentario, debe lanzar NotFoundException', async () =>{
            await expect(service.remove(1, 3)).rejects.toThrow(new NotFoundException("Comentario no encontrado."));
        })
        it('Si no se encuentra el usuario, debe lanzar NotFoundException', async () =>{
            const comentario = {id: 1, texto: 'comentario',};
            repoComentarios.findOne.mockResolvedValue(comentario as any)

            await expect(service.remove(1, 3)).rejects.toThrow(new NotFoundException("Usuario no encontrado."))
        })
        it('Si no es el autor del comentario y no es admin, debe lanzar ForbiddenException', async () =>{
            const user = {id: 2, nombre: 'pablo'};
            const otroUser = {id: 4, nombre: 'noPablo'}
            const comentario = {id: 1, texto: 'comentario', user: user};

            repoComentarios.findOne.mockResolvedValue(comentario as any);
            repoUsers.findOneBy.mockResolvedValue(otroUser as any);
            repoComentarios.remove.mockResolvedValue(comentario as any);

            await expect(service.remove(1, 4)).rejects.toThrow(ForbiddenException);
        })
    })
})