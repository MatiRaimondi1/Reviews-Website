import { AuthService } from './auth.service';
import { UsersService } from 'src/users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn()
}));

function createMockUser(overrides = {}): User {
    return {
        id: 1,
        username: 'usuario',
        email: 'test@mail.com',
        password: 'hashed-password',
        rol: 'user',
        fechaCreacion: new Date(2025, 5, 30),
        nivel: 1,
        urlImagen: './img/defaultUser.png',
        reviews: [],
        deletedAt: null,
        gruposRelacionados: [],
        comentarios: [],
        ...overrides,
    };
}

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: jest.Mocked<UsersService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(() => {
        usersService = {
            findOneByEmail: jest.fn(),
            findOneByUsername: jest.fn(),
            create: jest.fn(),
        } as any;

        jwtService = {
            sign: jest.fn(),
            signAsync: jest.fn(),
        } as any;

        authService = new AuthService(usersService, jwtService);
    });

    describe('register', () => {
        it('debería registrar un nuevo usuario si no existe el email ni el username', async () => {
            const dto: RegisterDto = {
                username: 'usuario',
                email: 'test@mail.com',
                password: '123456',
            };

            usersService.findOneByEmail.mockResolvedValue(null);
            usersService.findOneByUsername.mockResolvedValue(null);

            const createdUser = createMockUser();
            usersService.create.mockResolvedValue(createdUser);
            const result = await authService.register(dto);

            expect(usersService.findOneByEmail).toHaveBeenCalledWith(dto.email);
            expect(usersService.findOneByUsername).toHaveBeenCalledWith(dto.username);
            expect(usersService.create).toHaveBeenCalledWith({
                username: dto.username,
                email: dto.email,
                password: 'hashed-password',
            });
            expect(result).toEqual(createdUser);
        });
    });

    it('debe devolver un token si el login es correcto', async () => {
        const dto: LoginDto = {
            email: 'test@example.com',
            password: '123456',
        };

        const mockUser = createMockUser()

        usersService.findOneByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        jwtService.signAsync.mockResolvedValue('fake-jwt-token');

        const result = await authService.login(dto);

        expect(usersService.findOneByEmail).toHaveBeenCalledWith(dto.email);
        expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, mockUser.password);
        expect(jwtService.signAsync).toHaveBeenCalledWith({
            sub: mockUser.id,
            role: mockUser.rol,
        });

        expect(result).toEqual({
            access_token: 'fake-jwt-token',
            mensaje: 'Login correcto.',
        });
    });
});