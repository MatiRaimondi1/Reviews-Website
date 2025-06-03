import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        create: jest.fn(),
        findOneByEmail: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        updateProfileImage: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService)

        jest.clearAllMocks();
    })

    describe('findAll', () => {
        it('debe llamar a findAll y devolver el resultado', async () => {

            const result = { id: 1, nombre: "Pablo" };
            mockUsersService.findAll.mockResolvedValue(result)

            const response = await controller.findAll()

            expect(response).toEqual(result)
        })
    })

    describe('findOne', () => {
        it('debe llamar a findOne con el ID y devolver el resultado', async () => {
            const result = { id: 3, nombre: "Pablo" };
            mockUsersService.findOne.mockResolvedValue(result);

            const response = await controller.findOne('3');

            expect(mockUsersService.findOne).toHaveBeenCalledWith(3);
            expect(response).toEqual(result);
        })
    })

    describe('uploadProfileImage', () => {
        const mockReq = {
            user: { id: 1 },
        };

        it('debería llamar al servicio con los datos correctos si hay archivo', async () => {
            const mockFile = {
                filename: 'user-12345.png',
            } as Express.Multer.File;

            const expectedUrl = '/uploads/user-12345.png';

            mockUsersService.updateProfileImage.mockResolvedValue({ message: 'Imagen de perfil cambiada correctamente.' });

            const result = await controller.uploadProfileImage(mockReq, mockFile);

            expect(mockUsersService.updateProfileImage).toHaveBeenCalledWith(1, expectedUrl);
            expect(result).toEqual({ message: 'Imagen de perfil cambiada correctamente.' });
        });
    });

})