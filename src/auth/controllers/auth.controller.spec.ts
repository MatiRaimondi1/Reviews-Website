import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
        .overrideGuard(ThrottlerGuard)
        .useValue({
            canActivate: jest.fn().mockReturnValue(true),
        })
        .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('debe registrar un nuevo usuario y devolverlo', async () => {
            const dto: RegisterDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123456',
            };

            const expectedResult = { id: 1, ...dto, password: 'hashed-password' };

            mockAuthService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(dto);
            expect(authService.register).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('login', () => {
        it('debe devolver un token de acceso si el login es correcto', async () => {
            const dto: LoginDto = {
                email: 'test@example.com',
                password: '123456',
            };

            const expectedResult = {
                access_token: 'jwt-token',
                mensaje: 'Login correcto.',
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(dto);
            expect(authService.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });
    });
});