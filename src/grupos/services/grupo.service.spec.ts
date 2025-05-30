import { Repository } from "typeorm";
import { Grupo } from "../entities/grupo.entity"
import { GrupoService } from "./grupo.service"
import { User } from "src/users/entities/user.entity";
import { MembresiaGrupo } from "../entities/membresiaGrupo.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
})

describe ('GrupoService', () =>{
    let service: GrupoService;
    let repoGrupos: jest.Mocked<Repository<Grupo>>;
    let repoUsers: jest.Mocked<Repository<User>>;
    let repoMembresias: jest.Mocked<Repository<MembresiaGrupo>>;

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GrupoService,
                {
                    provide: getRepositoryToken(Grupo),
                    useFactory: mockRepo,
                },
                {
                    provide: getRepositoryToken(User),
                    useFactory: mockRepo,
                },
                {
                    provide: getRepositoryToken(MembresiaGrupo),
                    useFactory: mockRepo,
                },
            ]
        }).compile();

        service = module.get<GrupoService>(GrupoService);
        repoGrupos = module.get(getRepositoryToken(Grupo));
        repoUsers = module.get(getRepositoryToken(User));
        repoMembresias = module.get(getRepositoryToken(MembresiaGrupo));
    });

    describe('create', () =>{
        it('Debe crear un nuevo grupo', async () =>{
            const grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo'};
            const user = {id: 1, nombre: 'Pablo'}

            repoUsers.findOneBy.mockResolvedValue(user as any)
            
            repoGrupos.create.mockReturnValue(grupo as any)
            repoGrupos.save.mockResolvedValue(grupo as any);

            const result = await service.create(grupo.nombre, 2, grupo.descripcion);

            expect(repoGrupos.save).toHaveBeenCalledWith(grupo);
            expect(result).toEqual(grupo);
        })
    })

    describe('join', () =>{
        it('Debe permitirle a un usuario unirse a un grupo', async () =>{
            const grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo'};
            const user = {id: 2, nombre: 'Juan'};
            const membresiaGrupo = {id: 3, user: user, grupo: grupo, rol: 'miembro',}

            repoUsers.findOneBy.mockResolvedValue(user as any);
            repoGrupos.findOneBy.mockResolvedValue(grupo as any);

            repoMembresias.create.mockReturnValue(membresiaGrupo as any);
            repoMembresias.save.mockResolvedValue(membresiaGrupo as any);

            const result = await service.join(1, 2);

            expect(repoMembresias.create).toHaveBeenCalledWith({grupo, user: user, rol: 'miembro'});
            expect(repoMembresias.save).toHaveBeenCalledWith(membresiaGrupo)
            expect(result).toEqual({ mensaje: 'Te uniste al grupo correctamente' })
        })
    })

    describe('getAll', () =>{
        it('Debe obtener todos los grupos', async() =>{
            const grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo'};
            repoGrupos.find.mockResolvedValue(grupo as any)

            const result = await service.getAll();

            expect(result).toEqual(grupo);
        })
    })

    describe('getOneById', () =>{
        it('Debe obtener un solo grupo mediante su Id', async()=>{
            const grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo'};
            repoGrupos.findOneBy.mockResolvedValue(grupo as any)

            const result = await service.getOneById(1);

            expect(repoGrupos.findOneBy).toHaveBeenCalledWith({id: 1});
            expect(result).toEqual(grupo);
        })
    })

    describe('getMembers', () =>{
        it('Debe obtener los miembros de un grupo', async()=>{
            let grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo', usuariosRelacionados: {}};
            const user = {id: 2, username: 'Juan'};
            const membresiaGrupo = {id: 3, user: user, grupo: grupo, rol: 'miembro',}
            grupo = {id: 1, nombre: 'Pablolandia', descripcion:'Grupo de Pablo', usuariosRelacionados: [membresiaGrupo]}

            repoGrupos.findOne.mockResolvedValue(grupo as any);
            
            const result = await service.getMembers(1);

            expect(result).toEqual([{id: 2, nombre: 'Juan', rol: 'miembro'}]);
        })
    })
})