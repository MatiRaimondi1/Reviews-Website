import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        create: jest.fn(),
        findOneByEmail: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide:UsersService, useValue: mockUsersService },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService)

        jest.clearAllMocks();
    })

    describe('create', () =>{
        it('debe llamar a create con el dto y devolver el resultado', async () =>{
            const dto: CreateUserDto = {
                username: 'Pablo',
                email: 'pablo@ejemplo.com',
                password: 'contrasenia',
            }

            const created = { id:1, ...dto};
            mockUsersService.create.mockResolvedValue(created);

            const response =  await controller.create(dto);

            expect(mockUsersService.create).toHaveBeenCalledWith(dto);
            expect(response).toEqual(created)
        });
    })

    describe ('findAll', () => {
        it('debe llamar a findAll y devolver el resultado', async () => {
            
            const result = {id: 1, nombre: "Pablo"};
            mockUsersService.findAll.mockResolvedValue(result)

            const response = await controller.findAll()

            expect(response).toEqual(result)
        })
    })

    describe ('findOne', () =>{
        it ('debe llamar a findOne con el ID y devolver el resultado', async () =>{
            const result = {id: 3, nombre: "Pablo"};
            mockUsersService.findOne.mockResolvedValue(result);

            const response = await controller.findOne('3');

            expect(mockUsersService.findOne).toHaveBeenCalledWith(3);
            expect(response).toEqual(result);
        })
    })
})