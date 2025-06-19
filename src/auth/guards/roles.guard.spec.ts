import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = {
            get: jest.fn(),
        } as any;

        guard = new RolesGuard(reflector);
    });

    const mockExecutionContext = (user?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user,
                }),
            }),
            getHandler: jest.fn(),
        } as any;
    };

    it('debería permitir acceso si no se requiere ningún rol', () => {
        (reflector.get as jest.Mock).mockReturnValue(undefined);
        const context = mockExecutionContext({ role: 'admin' });
        expect(guard.canActivate(context)).toBe(true);
    });

    it('debería permitir acceso si el usuario tiene el rol requerido', () => {
        (reflector.get as jest.Mock).mockReturnValue(['admin']);
        const context = mockExecutionContext({ role: 'admin' });
        expect(guard.canActivate(context)).toBe(true);
    });

    it('debería lanzar ForbiddenException si el usuario no tiene el rol requerido', () => {
        (reflector.get as jest.Mock).mockReturnValue(['admin']);
        const context = mockExecutionContext({ role: 'user' });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debería lanzar ForbiddenException si no hay usuario en la request', () => {
        (reflector.get as jest.Mock).mockReturnValue(['admin']);
        const context = mockExecutionContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
});