import { Repository } from "typeorm"
import { Reunion } from "../entities/reunion.entity"
import { User } from "src/users/entities/user.entity"
import { Grupo } from "src/grupos/entities/grupo.entity"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ReunionService } from "./reunion.service"
import { CreateReunionDto } from "../dto/create-reunion.dto"

const mockRepoReunion = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    findUserWithGrupos: jest.fn(),
})

describe('reunionService', () =>{
    let service: ReunionService;
    let repoReunion: jest.Mocked<Repository<Reunion>>;
    let repoUsers: jest.Mocked<Repository<User>>;
    let repoGrupos: jest.Mocked<Repository<Grupo>>;

    beforeEach(async () =>{
        const module: TestingModule = await Test.createTestingModule({
            providers:[
                ReunionService,
                {
                    provide: getRepositoryToken(Reunion),
                    useFactory: mockRepoReunion,
                },
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepoReunion,
                },
                {
                    provide: getRepositoryToken(Grupo),
                    useFactory: mockRepoReunion,
                },
            ]
        }).compile();

        service = module.get<ReunionService>(ReunionService);
        repoReunion = module.get(getRepositoryToken(Reunion));
        repoUsers = module.get(getRepositoryToken(User));
        repoGrupos = module.get(getRepositoryToken(Grupo));
    })

    describe('create', () =>{
        it('debe crear una reunion', async () =>{
            const dto: CreateReunionDto = {
                fecha: new Date(),
                link: 'link.com'
            };
            const grupo = {id: 3, nombre: 'pablolandia', descripcion: 'grupo de pablo'};
            let user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: {} };
            const membresiaGrupo = {id: 4, user: user, grupo: grupo, rol:'lider'}
            user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: [membresiaGrupo]}
            const reunion = {id: 1, ...dto, grupoId: 3};

            repoUsers.findOne.mockResolvedValue(user as any);
            repoReunion.create.mockReturnValue(reunion as any)
            repoReunion.save.mockResolvedValue(reunion as any);
            

            const result = await service.create(2, dto);

            expect(repoReunion.save).toHaveBeenCalledWith(reunion);
            expect(result).toEqual(reunion);
            
        })
    })

    describe('delete', () =>{
        it('debe borrar una reunion y devolver el mensaje de confirmacion', async () =>{
            const dto: CreateReunionDto = {
                fecha: new Date(),
                link: 'link.com'
            };
            const grupo = {id: 3, nombre: 'pablolandia', descripcion: 'grupo de pablo'};
            let user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: {} };
            const membresiaGrupo = {id: 4, user: user, grupo: grupo, rol:'lider'}
            user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: [membresiaGrupo]}
            const reunion = {id: 1, ...dto, grupo: grupo};

            repoUsers.findOne.mockResolvedValue(user as any);
            repoReunion.findOne.mockResolvedValue(reunion as any);

            repoReunion.remove.mockResolvedValue(reunion as any);

            const result = await service.delete(2);

            expect(repoReunion.remove).toHaveBeenCalledWith(reunion)
            expect(result).toEqual({ message: 'Reunión eliminada correctamente.' })
        })
    })

    describe('getReunion', () =>{
        it('Debe encontrar la reunion en base al usuario', async () =>{ 
            const dto: CreateReunionDto = {
                    fecha: new Date(),
                    link: 'link.com'
            };
            const grupo = {id: 3, nombre: 'pablolandia', descripcion: 'grupo de pablo'};
            let user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: {} };
            const membresiaGrupo = {id: 4, user: user, grupo: grupo, rol:'lider'}
            user = {id: 2, username: 'pablo', email: 'pablo@ejemplo.com', password: 'contrasenia', gruposRelacionados: [membresiaGrupo]}
            const reunion = {id: 1, ...dto, grupo: grupo};

            repoUsers.findOne.mockResolvedValue(user as any);
            repoReunion.findOne.mockResolvedValue(reunion as any);

            const result = await service.getReunion(2);

            expect(repoReunion.findOne).toHaveBeenCalledWith({
                where: { grupo: { id: 3} },
                relations: ['grupo'],
            });
            expect(result).toEqual(reunion);
        })
    })
})