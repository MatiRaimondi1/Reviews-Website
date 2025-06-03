import { Test, TestingModule } from "@nestjs/testing";
import { ReviewsService } from "../services/reviews.service";
import { ReviewsController } from "./reviews.controller"
import { CreateReviewDto } from "../dto/create-review.dto";

describe('Reviews Controller', () => {
    let controller: ReviewsController;
    let service: ReviewsService;

    const mockReviewsService = {
        create: jest.fn(),
        findByPelicula: jest.fn(),
        delete: jest.fn(),
        findByUsuario: jest.fn(),
        countByUsuario: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [
                { provide: ReviewsService, useValue: mockReviewsService },
            ],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
        service = module.get<ReviewsService>(ReviewsService);

        jest.clearAllMocks();
    })

    it('Review individual, debe llamar a create con el dto y devolver el resultado', async () => {
        const dto: CreateReviewDto = {
            texto: 'ejemplo',
            puntuacion: 5,
        };

        const req: any = {
            user: { id: 2 },
        };

        const created = { id: 1, ...dto };
        mockReviewsService.create.mockResolvedValue(created);

        const response = await controller.create(3, dto, req);

        expect(mockReviewsService.create).toHaveBeenCalledWith(dto, 2, 3, undefined);
        expect(response).toEqual(created);
    })

    it('Review grupal, debe llamar a create con el dto y devolver el resultado', async () => {
        const dto: CreateReviewDto = {
            texto: 'ejemplo',
            puntuacion: 5,
            grupoId: 4,
        };

        const req: any = {
            user: { id: 2 },
        };

        const created = { id: 1, ...dto };
        mockReviewsService.create.mockResolvedValue(created);

        const response = await controller.create(3, dto, req);

        expect(mockReviewsService.create).toHaveBeenCalledWith(dto, 2, 3, 4);
        expect(response).toEqual(created);
    })

    it('Debe obtener todas las reviews que tratan de una determinada pelicula', async () => {
        const review = { id: 1, peliculaID: 2 };
        mockReviewsService.findByPelicula.mockResolvedValue(review);

        const result = await controller.findByPelicula(2);

        expect(mockReviewsService.findByPelicula).toHaveBeenCalledWith(2);
        expect(result).toEqual(review);
    })

    it('Debe llamar a delete con el id y devolver true', async () => {
        mockReviewsService.delete.mockResolvedValue(true);

        const req: any = {
            user: { id: 2 },
        };

        const response = await controller.delete(1, req)

        expect(mockReviewsService.delete).toHaveBeenCalledWith(1, 2);
        expect(response).toBe(true);
    })


    it('debería retornar todas las reviews del usuario', async () => {
        const fakeReviews = [
            {
                id: 1,
                texto: 'Muy buena',
                puntuacion: 4,
                userId: 1,
                peliculaId: 1,
                pelicula: { id: 1, nombre: 'Matrix' },
                user: { id: 1, username: 'usuario1' },
                comentarios: [],
            },
        ];

        mockReviewsService.findByUsuario.mockResolvedValue(fakeReviews as any);

        const result = await controller.getReviewsByUsuario(1);

        expect(result).toEqual(fakeReviews);
        expect(mockReviewsService.findByUsuario).toHaveBeenCalledWith(1);
    });

    it('debería retornar la cantidad de reviews del usuario', async () => {
        mockReviewsService.countByUsuario.mockResolvedValue(3);

        const result = await controller.countReviewsByUsuario(1);

        expect(result).toEqual({ cantidad: 3 });
        expect(mockReviewsService.countByUsuario).toHaveBeenCalledWith(1);
    });
})