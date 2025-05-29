import { Test, TestingModule } from "@nestjs/testing";
import { ReunionService } from "../services/reunion.service";
import { ReunionController } from "./reunion.controller";

describe('UsersController', () => {
    let controller: ReunionController;
    let service: ReunionService;

    const mockReunionService = {
        create: jest.fn(),
        delete: jest.fn(),
        getReunionByGrupo: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReunionController],
            providers: [
                {provide: ReunionService, useValue: mockReunionService}
            ]
        }).compile();

        controller = module.get<ReunionController>(ReunionController);
        service = module.get<ReunionService>(ReunionService);

        jest.clearAllMocks;
    })

    describe('createReunion', () =>{
        it('Debe crear una reunion con el dto y la request y devolver el resultado', async () =>{
            const dto = {
                fecha: new Date(),
                link: 'link.com'
            };

            const req = {
                user: {id: 2},
            };

            const reunion = {id: 1, ...dto};
            mockReunionService.create.mockResolvedValue(reunion);

            const result = await controller.createReunion(dto, req);

            expect(mockReunionService.create).toHaveBeenCalledWith(2, dto);
            expect(result).toEqual(reunion);
        })
    })

    describe('deleteReunion', () =>{
        it('debe llamar al service para eliminar una reunion', async () =>{
            mockReunionService.delete.mockResolvedValue({ message: 'Reunión eliminada correctamente.' })
            const req = {
                user: {id: 2},
            };
            const result = await controller.deleteReunion(1, req);
            expect(mockReunionService.delete).toHaveBeenCalledWith(2, 1);
            expect(result).toEqual({ message: 'Reunión eliminada correctamente.' });
        })
    })

    describe('getReunion', () =>{
        it('debe obtener una reunion mediante su ID', async () =>{
            const reunion = {id: 1, fecha: new Date(), link: 'link.com', grupoId: 3};
            const req = {user: {id: 2},};

            mockReunionService.getReunionByGrupo.mockResolvedValue(reunion);
            const result = await controller.getReunion(3, req);

            expect(mockReunionService.getReunionByGrupo).toHaveBeenCalledWith(2, 3);
            expect(result).toEqual(reunion);
        })
    })
})