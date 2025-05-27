import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from '@nestjs/testing';

const mockRepo = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
});

describe ('UsersService', () => {
    let service: UsersService
    let repo: jest.Mocked<Repository<User>>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepo,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repo = module.get(getRepositoryToken(User));
    });

    it('findAll debe devolver todos los usuarios',  async () => {
        const result = [{ id: 1, nombre: 'Pablo' }];
        repo.find.mockResolvedValue(result as any);

        const response = await service.findAll();
        expect(response).toEqual(result);
    })

    it('findOne debe devolver un solo usuario basado en el ID', async () =>{
        const result = [{id: 1, nombre: 'Pablo'}];
        repo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findOne(1);
        expect(repo.findOneBy).toHaveBeenCalledWith({id: 1})
        expect(response).toEqual(result);
    })

    it('findOneByEmail debe devolver un solo usuario basado en el email', async () =>{
        const result = [{id: 1, nombre: 'Pablo', email: 'pablo@ejemplo.com'}];
        repo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findOneByEmail('pablo@ejemplo.com');
        expect(repo.findOneBy).toHaveBeenCalledWith({email: 'pablo@ejemplo.com'});
        expect(response).toEqual(result);
    })

    it('create debe guardar un nuevo usuario', async () =>{
        const dto = {
            username: 'Pablo',
            email: 'pablo@ejemplo.com',
            password: 'contrasenia',
        };
        const result = { id:1, ...dto};
        
        repo.create.mockReturnValue(result as any);
        repo.save.mockResolvedValue(result as any);

        const response = await service.create(dto)
        expect(response).toEqual(result);
        expect(repo.save).toHaveBeenCalledWith(result);
        expect(repo.create).toHaveBeenCalledWith(dto);
    })
})