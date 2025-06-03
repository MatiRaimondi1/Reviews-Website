import { Test, TestingModule } from "@nestjs/testing";
import { GrupoService } from "../services/grupo.service"
import { GrupoController } from "./grupo.controller"

describe('grupo controller', () => {
    let controller: GrupoController;
    let service: GrupoService;

    const mockGrupoService = {
        create: jest.fn(),
        join: jest.fn(),
        getAll: jest.fn(),
        getOneById: jest.fn(),
        getMembers: jest.fn(),
        countMembers: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GrupoController],
            providers: [
                { provide: GrupoService, useValue: mockGrupoService }
            ]
        }).compile();

        controller = module.get<GrupoController>(GrupoController);
        service = module.get<GrupoService>(GrupoService);

        jest.clearAllMocks;
    })

    describe('createGroup', () => {
        it('debe crear un nuevo grupo con el dto', async () => {
            const dto = {
                nombre: 'Pablolandia',
                descripcion: 'Grupo de Pablo',
            };
            const req = {
                user: { id: 2 }
            }

            const grupo = { id: 1, ...dto };
            mockGrupoService.create.mockResolvedValue(grupo);

            const result = await controller.createGroup(dto, req);

            expect(mockGrupoService.create).toHaveBeenCalledWith('Pablolandia', 2, 'Grupo de Pablo');
            expect(result).toEqual(grupo)
        })
    })

    describe('joinGroup', () => {
        it('debe permitirle a un usuario unirse a un grupo', async () => {
            const req = {
                user: { id: 2 }
            };
            const grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo' };

            mockGrupoService.join.mockResolvedValue({ mensaje: 'Te uniste al grupo correctamente' });

            const result = await controller.joinGroup(1, req);

            expect(mockGrupoService.join).toHaveBeenCalledWith(1, 2);
            expect(result).toEqual({ mensaje: 'Te uniste al grupo correctamente' });
        })
    })

    describe('getGroups', () => {
        it('debe devolver todos los grupos', async () => {
            const grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo' };
            mockGrupoService.getAll.mockResolvedValue(grupo);
            const result = await controller.getGroups();

            expect(result).toEqual(grupo);
        })
    })

    describe('getGroupById', () => {
        it('debe devolver un solo grupo, basado en el id', async () => {
            const grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo' };
            mockGrupoService.getOneById.mockResolvedValue(grupo);
            const result = await controller.getGroupById(1);

            expect(mockGrupoService.getOneById).toHaveBeenCalledWith(1);
            expect(result).toEqual(grupo);
        })
    })

    describe('getMemebersByGroup', () => {
        it('debe devolver todos los miembros de un grupo', async () => {
            let grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo', usuariosRelacionados: {} };
            const user = { id: 2, };
            const membresiaGrupo = { id: 1, user: user, grupo: grupo, rol: 'miembro' };
            grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo', usuariosRelacionados: [membresiaGrupo] };

            mockGrupoService.getMembers.mockResolvedValue(user);

            const result = await controller.getMembersByGroup(1);

            expect(mockGrupoService.getMembers).toHaveBeenCalledWith(1);
            expect(result).toEqual(user);
        })
    })

    it('debería devolver la cantidad de miembros del grupo', async () => {
        jest.spyOn(service, 'countMembers').mockResolvedValue(4);

        const result = await controller.countMembers(1);

        expect(result).toEqual({ cantidad: 4 });
        expect(service.countMembers).toHaveBeenCalledWith(1);
    });
})