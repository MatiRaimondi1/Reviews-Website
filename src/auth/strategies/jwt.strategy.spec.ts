import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let configService: ConfigService;

    beforeEach(() => {
        configService = {
            get: jest.fn((key: string) => {
                if (key === 'AUTH_SECRET') return 'test-secret';
                return null;
            }),
        } as any;

        jwtStrategy = new JwtStrategy(configService);
    });

    it('debería crear la estrategia con el secreto proporcionado', () => {
        expect(configService.get).toHaveBeenCalledWith('AUTH_SECRET');
    });

    it('debería lanzar un error si AUTH_SECRET no está definido', () => {
        const brokenConfig = {
            get: jest.fn(() => null),
        } as any;

        expect(() => new JwtStrategy(brokenConfig)).toThrowError(
            'AUTH_SECRET is not defined.',
        );
    });

    it('debería validar el payload correctamente', async () => {
        const payload = { sub: 1, role: 'admin' };
        const result = await jwtStrategy.validate(payload);
        expect(result).toEqual({ id: 1, role: 'admin' });
    });
});