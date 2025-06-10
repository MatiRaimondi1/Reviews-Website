import { Repository } from "typeorm";
import { GenerosService } from "./generos.service"
import { Genero } from "../entities/genero.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException } from "@nestjs/common";

const mockRepoGenero = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
})

describe('generosService', () => {
    let service: GenerosService;
    let generosRepo: jest.Mocked<Repository<Genero>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GenerosService,
                {
                    provide: getRepositoryToken(Genero),
                    useFactory: mockRepoGenero,
                },
            ]
        }).compile()

        service = module.get<GenerosService>(GenerosService);
        generosRepo = module.get(getRepositoryToken(Genero));
    })

    it('deberia devolver todos los generos', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        generosRepo.find.mockResolvedValue(result as any);

        const response = await service.findAll();
        expect(result).toEqual(response);
    })

    it('si no hay generos, findAll debe tirar una excepcion', async () => {
        generosRepo.find.mockResolvedValue([]);

        await expect(service.findAll()).rejects.toThrow(NotFoundException);
    })

    it('deberia devolver un genero por su nombre', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        generosRepo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findByName("Drama");
        expect(generosRepo.findOneBy).toHaveBeenCalledWith({ nombre: "Drama" });
        expect(result).toEqual(response);
    })

    it('si no hay un genero con ese nombre, findByName debe tirar una excepcion', async () => {
        generosRepo.find.mockResolvedValue([]);

        await expect(service.findByName("Drama")).rejects.toThrow(NotFoundException);
    })

    it('deberia devolver un genero por su id', async () => {
        const result = [{ id: 1, nombre: 'Drama' }];
        generosRepo.findOneBy.mockResolvedValue(result as any);

        const response = await service.findById(1);
        expect(generosRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
        expect(result).toEqual(response);
    })

    it('si no hay un genero con ese id, findById debe tirar una excepcion', async () => {
        generosRepo.find.mockResolvedValue([]);

        await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    })
})