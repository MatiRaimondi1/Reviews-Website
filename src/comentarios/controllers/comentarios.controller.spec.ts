import { Test, TestingModule } from "@nestjs/testing";
import { ComentariosService } from "../services/comentarios.service";
import { ComentariosController } from "./comentarios.controller"

describe('ComentariosController', () => {
    let controller: ComentariosController;
    let service: ComentariosService;

    const mockComentariosService = {
        create: jest.fn(),
        findByReview: jest.fn(),
        remove: jest.fn(),
    }

    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ComentariosController],
            providers: [
                {provide: ComentariosService, useValue: mockComentariosService}
            ]
        }).compile()

        controller = module.get<ComentariosController>(ComentariosController);
        service = module.get<ComentariosService>(ComentariosService);
        
        jest.clearAllMocks;
    })

    describe('create', () =>{
        it ('Debe crear un comentario con el dto', async () =>{
            const dto = {
                texto: 'comentario'
            }
            const req ={
                user: {id: 2},
            }
            const review = {}
            const comentario = {id: 1, ...dto};
            mockComentariosService.create.mockResolvedValue(comentario);

            const result = await controller.create(3, dto, req);

            expect(mockComentariosService.create).toHaveBeenCalledWith(3, 2, dto, );
            expect(result).toEqual(comentario);
        })
    })

    describe('findByReview', () =>{
        it('debe obtener todos los comentarios de una review especifica', async () =>{
            const comentario = {id: 1, texto: 'comentario'};

            mockComentariosService.findByReview.mockResolvedValue(comentario);

            const result = await controller.findByReview(2);

            expect(mockComentariosService.findByReview).toHaveBeenCalledWith(2, 0);
            expect(result).toEqual(comentario);
        })
    })

    describe('remove', () =>{
        it('debe eliminar un comentario y confirmar su eliminacion', async () =>{
            mockComentariosService.remove.mockResolvedValue({ success: true, message: 'Comentario eliminado correctamente.' })
            const req ={
                user: {id: 2},
            }

            const result = await controller.remove(1, req);

            expect(mockComentariosService.remove).toHaveBeenCalledWith(1, 2);
            expect(result).toEqual({ success: true, message: 'Comentario eliminado correctamente.' })
        })
    })
})