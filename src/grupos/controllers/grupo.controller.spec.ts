import { Test, TestingModule } from "@nestjs/testing";
import { GrupoService } from "../services/grupo.service"
import { GrupoController } from "./grupo.controller"
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Grupo } from "../entities/grupo.entity";

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
        leave: jest.fn(),
        delete: jest.fn(),
        getByName: jest.fn(),
        isUserInGroup: jest.fn(),
        update: jest.fn(),
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

    it('debe devolver todos los grupos', async () => {
        const grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo' };
        mockGrupoService.getAll.mockResolvedValue(grupo);
        const result = await controller.getGroups();

        expect(result).toEqual(grupo);
    })

    it('debe devolver un solo grupo, basado en el id', async () => {
        const grupo = { id: 1, nombre: 'Pablolandia', descripcion: 'Grupo de Pablo' };
        mockGrupoService.getOneById.mockResolvedValue(grupo);
        const result = await controller.getGroupById(1);

        expect(mockGrupoService.getOneById).toHaveBeenCalledWith(1);
        expect(result).toEqual(grupo);
    })

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

    it('debería devolver la cantidad de miembros del grupo', async () => {
        jest.spyOn(service, 'countMembers').mockResolvedValue(4);

        const result = await controller.countMembers(1);

        expect(result).toEqual({ cantidad: 4 });
        expect(service.countMembers).toHaveBeenCalledWith(1);
    });

    it('debería llamar a grupoService.leave con los ids correctos y devolver el resultado', async () => {
        const grupoId = 1;
        const userId = 42;

        const reqMock = { user: { id: userId } };
        const expectedResponse = { mensaje: 'Saliste del grupo correctamente' };

        jest.spyOn(service, 'leave').mockResolvedValue(expectedResponse);

        const result = await controller.leaveGroup(grupoId, reqMock as any);

        expect(service.leave).toHaveBeenCalledWith(grupoId, userId);
        expect(result).toEqual(expectedResponse);
    });

    it('debería eliminar el grupo si el usuario es líder', async () => {
        const grupoId = 1;
        const userId = 10;
        const req = { user: { id: userId } };
        const mensaje = { mensaje: 'Grupo eliminado correctamente' };

        mockGrupoService.delete.mockResolvedValue(mensaje);

        const result = await controller.deleteGroup(grupoId, req);

        expect(result).toEqual(mensaje);
        expect(mockGrupoService.delete).toHaveBeenCalledWith(grupoId, userId);
    });

    it('debería devolver resultados cuando la query es válida', async () => {
        const mockQuery = 'cine';
        const mockResponse = [{ id: 1, nombre: 'Grupo Cine' }] as unknown as Grupo[];
        jest.spyOn(service, 'getByName').mockResolvedValue(mockResponse);

        const result = await controller.search(mockQuery);

        expect(service.getByName).toHaveBeenCalledWith(mockQuery);
        expect(result).toEqual(mockResponse);
    });

    it('debería lanzar BadRequestException si la query está vacía', () => {
        expect(() => controller.search('')).toThrow(BadRequestException);
        expect(() => controller.search('   ')).toThrow(BadRequestException);
    });

    it('debe devolver el resultado del service', async () => {
        const mockResponse = { mensaje: 'El usuario pertenece al grupo.' };
        (service.isUserInGroup as jest.Mock).mockResolvedValue(mockResponse);

        const grupoId = 5;
        const userId = 10;

        const result = await controller.isUserInGroup(grupoId, userId);

        expect(service.isUserInGroup).toHaveBeenCalledWith(userId, grupoId);
        expect(result).toEqual(mockResponse);
    });

    it('debería llamar a grupoService.update con los parámetros correctos y devolver resultado', async () => {
        const grupoId = 1;
        const userId = 42;
        const cambios = { nombre: 'Nuevo Nombre', descripcion: 'Nueva descripción' };
        const mockRequest = { user: { id: userId } };
        const mockResponse = {
            mensaje: 'Grupo actualizado correctamente',
            grupo: {
                id: 1,
                nombre: 'Nuevo Nombre',
                descripcion: 'Nueva descripción',
            } as Grupo,
        };

        jest.spyOn(service, 'update').mockResolvedValue(mockResponse);

        const resultado = await controller.update(grupoId, mockRequest, cambios);

        expect(service.update).toHaveBeenCalledWith(grupoId, userId, cambios);
        expect(resultado).toEqual(mockResponse);
    });

    it('debería propagar excepciones lanzadas por el servicio', async () => {
        const grupoId = 1;
        const userId = 42;
        const cambios = { nombre: 'Nombre' };
        const mockRequest = { user: { id: userId } };

        jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException('Grupo no encontrado'));

        await expect(controller.update(grupoId, mockRequest, cambios)).rejects.toThrow(NotFoundException);
    });
})