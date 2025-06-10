import { Not, Repository } from 'typeorm';
import { Grupo } from '../entities/grupo.entity';
import { GrupoService } from './grupo.service';
import { User } from 'src/users/entities/user.entity';
import { MembresiaGrupo } from '../entities/membresiaGrupo.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

describe('GrupoService', () => {
  let service: GrupoService;
  let repoGrupos: jest.Mocked<Repository<Grupo>>;
  let repoUsers: jest.Mocked<Repository<User>>;
  let repoMembresias: jest.Mocked<Repository<MembresiaGrupo>>;

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<GrupoService>(GrupoService);
    repoGrupos = module.get(getRepositoryToken(Grupo));
    repoUsers = module.get(getRepositoryToken(User));
    repoMembresias = module.get(getRepositoryToken(MembresiaGrupo));
  });

  it('Debe crear un nuevo grupo', async () => {
    const grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
    };
    const user = { id: 1, nombre: 'Pablo' };

    repoUsers.findOneBy.mockResolvedValue(user as any);

    repoGrupos.create.mockReturnValue(grupo as any);
    repoGrupos.save.mockResolvedValue(grupo as any);

    const result = await service.create(grupo.nombre, 2, grupo.descripcion);

    expect(repoGrupos.save).toHaveBeenCalledWith(grupo);
    expect(result).toEqual(grupo);
  });

  it('Debe permitirle a un usuario unirse a un grupo', async () => {
    const grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
    };
    const user = { id: 2, nombre: 'Juan' };
    const membresiaGrupo = { id: 3, user: user, grupo: grupo, rol: 'miembro' };

    repoUsers.findOneBy.mockResolvedValue(user as any);
    repoGrupos.findOneBy.mockResolvedValue(grupo as any);

    repoMembresias.create.mockReturnValue(membresiaGrupo as any);
    repoMembresias.save.mockResolvedValue(membresiaGrupo as any);

    const result = await service.join(1, 2);

    expect(repoMembresias.create).toHaveBeenCalledWith({
      grupo,
      user: user,
      rol: 'miembro',
    });
    expect(repoMembresias.save).toHaveBeenCalledWith(membresiaGrupo);
    expect(result).toEqual({ mensaje: 'Te uniste al grupo correctamente' });
  });
  it('Si no se encuentra el Usuario, debe lanzar NotFoundException', async () =>{
    await expect(service.join(1, 2)).rejects.toThrow(NotFoundException);
  })
  it('Si el usuario ya tiene grupo, debe lanzar ConflictException', async ()=>{
    const user = { id: 2, nombre: 'Juan' };
    const membresiaGrupo = { id: 3}

    repoUsers.findOneBy.mockResolvedValue(user as any);
    repoMembresias.findOne.mockResolvedValue(membresiaGrupo as any);

    await expect(service.join(1, 2)).rejects.toThrow(ConflictException)
  })
  it('Si no se encuentra el grupo, debe lanzar NotFoundException', async () =>{
    const user = { id: 2, nombre: 'Juan' };
    repoUsers.findOneBy.mockResolvedValue(user as any);

    await expect(service.join(1, 2)).rejects.toThrow(NotFoundException);
  })

  it('Debe obtener todos los grupos', async () => {
    const grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
    };
    repoGrupos.find.mockResolvedValue(grupo as any);

    const result = await service.getAll();

    expect(result).toEqual(grupo);
  });
  it('Si no se encuentran grupos, debe arrojar NotFoundException', async () =>{
    await expect(service.getAll()).rejects.toThrow(NotFoundException)
  })

  it('Debe obtener un solo grupo mediante su Id', async () => {
    const grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
    };
    repoGrupos.findOneBy.mockResolvedValue(grupo as any);

    const result = await service.getOneById(1);

    expect(repoGrupos.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(grupo);
  });
  it('Si no se encontro al grupo, debe arrojar NotFoundException', async () =>{
    await expect(service.getOneById(1)).rejects.toThrow(NotFoundException);
  })

  it('Debe obtener los miembros de un grupo', async () => {
    let grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
      usuariosRelacionados: {},
    };
    const user = { id: 2, username: 'Juan' };
    const membresiaGrupo = { id: 3, user: user, grupo: grupo, rol: 'miembro' };
    grupo = {
      id: 1,
      nombre: 'Pablolandia',
      descripcion: 'Grupo de Pablo',
      usuariosRelacionados: [membresiaGrupo],
    };

    repoGrupos.findOne.mockResolvedValue(grupo as any);

    const result = await service.getMembers(1);

    expect(result).toEqual([{ id: 2, nombre: 'Juan', rol: 'miembro' }]);
  });
  it('Si no se encontro al grupo, debe arrojar NotFoundException', async () =>{
    await expect(service.getMembers(1)).rejects.toThrow(NotFoundException);
  })

  it('Debería devolver la cantidad de miembros del grupo', async () => {
    const fakeGrupo = {
      id: 1,
      usuariosRelacionados: [{}, {}, {}],
    } as Grupo;

    jest.spyOn(repoGrupos, 'findOne').mockResolvedValue(fakeGrupo);

    const result = await service.countMembers(1);
    expect(result).toBe(3);
  });
  it('Si no se encontro al grupo, debe arrojar NotFoundException', async () =>{
    await expect(service.countMembers(1)).rejects.toThrow(NotFoundException);
  })

  it('Debería permitir salir del grupo si hay más miembros', async () => {
    const relacionMock = {
      grupo: { id: 1 },
      user: { id: 2 },
    } as MembresiaGrupo;

    repoMembresias.findOne.mockResolvedValue(relacionMock);
    repoMembresias.remove.mockResolvedValue(undefined!);
    repoMembresias.count.mockResolvedValue(2);

    const result = await service.leave(1, 2);

    expect(repoMembresias.findOne).toHaveBeenCalledWith({
      where: {
        grupo: { id: 1 },
        user: { id: 2 },
      },
      relations: ['grupo', 'user'],
    });

    expect(repoMembresias.remove).toHaveBeenCalledWith(relacionMock);
    expect(repoGrupos.delete).not.toHaveBeenCalled();

    expect(result).toEqual({ mensaje: 'Saliste del grupo correctamente' });
  });
  it('Debería eliminar el grupo si era el último miembro', async () => {
    const relacionMock = {
      grupo: { id: 1 },
      user: { id: 2 },
    } as MembresiaGrupo;

    repoMembresias.findOne.mockResolvedValue(relacionMock);
    repoMembresias.remove.mockResolvedValue(undefined!);
    repoMembresias.count.mockResolvedValue(0);

    const result = await service.leave(1, 2);

    expect(repoMembresias.remove).toHaveBeenCalled();
    expect(repoGrupos.delete).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      mensaje:
        'Saliste del grupo. El grupo fue eliminado porque no tenía más miembros.',
    });
  });
  it('Debería lanzar error si el usuario no está en el grupo', async () => {
    repoMembresias.findOne.mockResolvedValue(null);

    await expect(service.leave(1, 99)).rejects.toThrow(NotFoundException);
  });

  describe('delete', () => {
    const grupoId = 1;
    const userId = 2;

    const grupo = {
      id: grupoId,
      nombre: 'Grupo Test',
      descripcion: 'Descripción',
      createdAt: new Date(),
      usuariosRelacionados: [],
    } as unknown as Grupo;

    it('Debería eliminar el grupo si el usuario es líder', async () => {
      const relacion = {
        id: 1,
        rol: 'lider',
        user: { id: userId } as User,
        grupo: grupo,
      } as MembresiaGrupo;

      const user = {
        id: userId,
        rol: 'user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        fechaCreacion: new Date(),
      } as User;

      repoGrupos.findOneBy.mockResolvedValue(grupo);
      repoMembresias.findOne.mockResolvedValue(relacion);
      repoUsers.findOneBy.mockResolvedValue(user);
      repoGrupos.remove.mockResolvedValue(undefined!);

      const result = await service.delete(grupoId, userId);

      expect(repoGrupos.findOneBy).toHaveBeenCalledWith({ id: grupoId });
      expect(repoMembresias.findOne).toHaveBeenCalledWith({
        where: { grupo: { id: grupoId }, user: { id: userId } },
      });
      expect(repoUsers.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(repoGrupos.remove).toHaveBeenCalledWith(grupo);
      expect(result).toEqual({ mensaje: 'Grupo eliminado correctamente' });
    });

    it('Debería eliminar el grupo si el usuario es admin aunque no sea líder', async () => {
      const relacion = {
        id: 1,
        rol: 'miembro',
        user: { id: userId } as User,
        grupo: grupo,
      } as MembresiaGrupo;

      const user = {
        id: userId,
        rol: 'admin',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        fechaCreacion: new Date(),
      } as User;

      repoGrupos.findOneBy.mockResolvedValue(grupo);
      repoMembresias.findOne.mockResolvedValue(relacion);
      repoUsers.findOneBy.mockResolvedValue(user);
      repoGrupos.remove.mockResolvedValue(undefined!);

      const result = await service.delete(grupoId, userId);

      expect(repoGrupos.findOneBy).toHaveBeenCalledWith({ id: grupoId });
      expect(repoMembresias.findOne).toHaveBeenCalledWith({
        where: { grupo: { id: grupoId }, user: { id: userId } },
      });
      expect(repoUsers.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(repoGrupos.remove).toHaveBeenCalledWith(grupo);
      expect(result).toEqual({ mensaje: 'Grupo eliminado correctamente' });
    });

    it('Debería lanzar ForbiddenException si el usuario no es líder ni admin', async () => {
      const relacion = {
        id: 1,
        rol: 'miembro',
        user: { id: userId } as User,
        grupo: grupo,
      } as MembresiaGrupo;

      const user = {
        id: userId,
        rol: 'user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        fechaCreacion: new Date(),
      } as User;

      repoGrupos.findOneBy.mockResolvedValue(grupo);
      repoMembresias.findOne.mockResolvedValue(relacion);
      repoUsers.findOneBy.mockResolvedValue(user);

      await expect(service.delete(grupoId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(repoGrupos.remove).not.toHaveBeenCalled();
    });

    it('Debería lanzar NotFoundException si no existe el grupo', async () => {
      repoGrupos.findOneBy.mockResolvedValue(null);

      await expect(service.delete(grupoId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repoMembresias.findOne).not.toHaveBeenCalled();
    });

    it('Debería lanzar NotFoundException si no existe el usuario', async () => {
      repoGrupos.findOneBy.mockResolvedValue(grupo);
      repoMembresias.findOne.mockResolvedValue(null);
      repoUsers.findOneBy.mockResolvedValue(null);

      await expect(service.delete(grupoId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('debería retornar grupos si existen', async () => {
    const nombre = 'cine';
    const gruposMock = [
      { id: 1, nombre: 'Grupo de cine' },
      { id: 2, nombre: 'Cine debate' },
    ] as Grupo[];

    repoGrupos.find.mockResolvedValue(gruposMock);

    const result = await service.getByName(nombre);

    expect(repoGrupos.find).toHaveBeenCalledWith({
      where: {
        nombre: expect.anything(),
      },
      order: { nombre: 'ASC' },
    });

    expect(result).toEqual(gruposMock);
  });

  it('debería lanzar NotFoundException si no hay grupos', async () => {
    repoGrupos.find.mockResolvedValue([]);

    await expect(service.getByName('algo')).rejects.toThrow(NotFoundException);
  });

  it('debe devolver mensaje que el usuario pertenece al grupo cuando la relación existe', async () => {
    repoMembresias.findOne.mockResolvedValue({
      rol: 'lider',
    } as MembresiaGrupo);

    const result = await service.isUserInGroup(1, 2);

    expect(repoMembresias.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
        grupo: { id: 2 },
      },
    });
    expect(result).toEqual({
      mensaje: 'El usuario pertenece al grupo.',
      enGrupo: true,
      rol: 'lider',
    });
  });

  it('debe devolver mensaje que el usuario no pertenece al grupo cuando la relación no existe', async () => {
    repoMembresias.findOne.mockResolvedValue(null);

    const result = await service.isUserInGroup(1, 2);

    expect(repoMembresias.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: 1 },
        grupo: { id: 2 },
      },
    });
    expect(result).toEqual({
      mensaje: 'El usuario no pertenece al grupo.',
      enGrupo: false,
      rol: '',
    });
  });

  it('debe lanzar NotFoundException si el grupo no existe', async () => {
    repoGrupos.findOneBy.mockResolvedValue(null);

    await expect(
      service.update(1, 1, { nombre: 'Nuevo nombre' }),
    ).rejects.toThrow(NotFoundException);
  });

  describe('edit', () => {
    const grupoOriginal = {
      id: 1,
      nombre: 'Grupo viejo',
      descripcion: 'desc',
      createdAt: new Date(),
      usuariosRelacionados: [],
      reviews: [],
      reunionId: null,
    } as unknown as Grupo;

    const membresiaMock = {
      id: 1,
      rol: 'miembro',
      user: { id: 10, nombre: 'Usuario' },
      grupo: { id: 5, nombre: 'Grupo 5' },
    } as unknown as MembresiaGrupo;

    const membresiaMockLider = {
      id: 1,
      rol: 'lider',
      user: { id: 10, nombre: 'Usuario' },
      grupo: { id: 5, nombre: 'Grupo 5' },
    } as unknown as MembresiaGrupo;

    const userMock = {
      id: 1,
      rol: 'user',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      fechaCreacion: new Date(),
    } as User;

    const adminMock = {
      id: 1,
      rol: 'admin',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      fechaCreacion: new Date(),
    } as User;

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repoGrupos.findOneBy.mockResolvedValue(grupoOriginal);
      repoMembresias.findOne.mockResolvedValue(membresiaMock);
      repoUsers.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(1, 2, { nombre: 'Nuevo nombre' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si el usuario no es líder ni admin', async () => {
      repoGrupos.findOneBy.mockResolvedValue(grupoOriginal);
      repoMembresias.findOne.mockResolvedValue(membresiaMock);
      repoUsers.findOneBy.mockResolvedValue(userMock);

      await expect(
        service.update(1, 2, { nombre: 'Nuevo nombre' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe actualizar el grupo si el usuario es líder', async () => {
      repoGrupos.findOneBy.mockResolvedValue(grupoOriginal);
      repoMembresias.findOne.mockResolvedValue(membresiaMockLider);
      repoUsers.findOneBy.mockResolvedValue(userMock);
      repoGrupos.save.mockResolvedValue({
        ...grupoOriginal,
        nombre: 'Nuevo nombre',
      });

      const cambios = { nombre: 'Nuevo nombre' };
      const resultado = await service.update(1, 2, cambios);

      expect(repoGrupos.save).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Nuevo nombre' }),
      );
      expect(resultado).toEqual({
        mensaje: 'Grupo actualizado correctamente',
        grupo: expect.objectContaining({ nombre: 'Nuevo nombre' }),
      });
    });

    it('debe actualizar el grupo si el usuario es admin', async () => {
      repoGrupos.findOneBy.mockResolvedValue(grupoOriginal);
      repoMembresias.findOne.mockResolvedValue(membresiaMock);
      repoUsers.findOneBy.mockResolvedValue(adminMock);
      repoGrupos.save.mockResolvedValue({
        ...grupoOriginal,
        descripcion: 'Nueva descripción',
      });

      const cambios = { descripcion: 'Nueva descripción' };
      const resultado = await service.update(1, 2, cambios);

      expect(repoGrupos.save).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: 'Nueva descripción' }),
      );
      expect(resultado).toEqual({
        mensaje: 'Grupo actualizado correctamente',
        grupo: expect.objectContaining({ descripcion: 'Nueva descripción' }),
      });
    });
  });

  it('debería expulsar al usuario correctamente si el solicitante es líder o admin', async () => {
    repoGrupos.findOneBy.mockResolvedValue({
      id: 1,
      nombre: 'Grupo1',
    } as Grupo);
    repoMembresias.findOne
      .mockResolvedValueOnce({ rol: 'lider' } as MembresiaGrupo)
      .mockResolvedValueOnce({ id: 10 } as MembresiaGrupo);
    repoUsers.findOneBy.mockResolvedValue({ id: 2, rol: 'miembro' } as User);
    repoMembresias.delete.mockResolvedValue(undefined!);

    const result = await service.kickUser(1, 3, 2);

    expect(repoGrupos.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(repoMembresias.findOne).toHaveBeenCalledTimes(2);
    expect(repoUsers.findOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(repoMembresias.delete).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      mensaje: 'Usuario expulsado correctamente del grupo.',
    });
  });

  it('debería lanzar NotFoundException si el grupo no existe', async () => {
    repoGrupos.findOneBy.mockResolvedValue(null);

    await expect(service.kickUser(1, 3, 2)).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar ForbiddenException si el solicitante no pertenece al grupo', async () => {
    repoGrupos.findOneBy.mockResolvedValue({ id: 1 } as Grupo);
    repoMembresias.findOne.mockResolvedValue(null);

    await expect(service.kickUser(1, 3, 2)).rejects.toThrow(ForbiddenException);
  });

  it('debería lanzar NotFoundException si el usuario solicitante no existe', async () => {
    repoGrupos.findOneBy.mockResolvedValue({ id: 1 } as Grupo);
    repoMembresias.findOne.mockResolvedValue({
      rol: 'lider',
    } as MembresiaGrupo);
    repoUsers.findOneBy.mockResolvedValue(null);

    await expect(service.kickUser(1, 3, 2)).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar ForbiddenException si el solicitante no es líder ni admin', async () => {
    repoGrupos.findOneBy.mockResolvedValue({ id: 1 } as Grupo);
    repoMembresias.findOne.mockResolvedValue({
      rol: 'miembro',
    } as MembresiaGrupo);
    repoUsers.findOneBy.mockResolvedValue({ rol: 'miembro' } as User);

    await expect(service.kickUser(1, 3, 2)).rejects.toThrow(ForbiddenException);
  });

  it('debería lanzar NotFoundException si el usuario a expulsar no pertenece al grupo', async () => {
    repoGrupos.findOneBy.mockResolvedValue({ id: 1 } as Grupo);
    repoMembresias.findOne
      .mockResolvedValueOnce({ rol: 'lider' } as MembresiaGrupo)
      .mockResolvedValueOnce(null);
    repoUsers.findOneBy.mockResolvedValue({ rol: 'admin' } as User);

    await expect(service.kickUser(1, 3, 2)).rejects.toThrow(NotFoundException);
  });
});
