import { Test, TestingModule } from "@nestjs/testing";
import { GenerosService } from "../services/generos.service";
import { GenerosController } from "./generos.controller"

describe('generosController', () => {
    let controller: GenerosController;
    let service: GenerosService

    const mockGenerosService = {
        findAll: jest.fn(),
        findByName: jest.fn(),
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GenerosController],
            providers: [
                {provide: GenerosService, useValue: mockGenerosService}
            ]
        }).compile();

        controller = module.get<GenerosController>(GenerosController);
        service = module.get<GenerosService>(GenerosService);

        jest.clearAllMocks;
    })

    it('debe llamar a findAll y devolver el resultado', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        mockGenerosService.findAll.mockResolvedValue(result)

        const response = await controller.findAll()
        expect(response).toEqual(result)
    })

    it('debe llamar a findByName y devolver el resultado', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        mockGenerosService.findByName.mockResolvedValue(result)

        const response = await controller.findByName("Drama")
        expect(response).toEqual(result)
    })

    it('debe llamar a findById y devolver el resultado', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        mockGenerosService.findById.mockResolvedValue(result)

        const response = await controller.findById(1)
        expect(response).toEqual(result)
    })
})