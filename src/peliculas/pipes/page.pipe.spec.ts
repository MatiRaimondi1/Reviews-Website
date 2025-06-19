import { PagePipe } from './page.pipe';
import { BadRequestException } from '@nestjs/common';

describe('PagePipe', () => {
    let pipe: PagePipe;

    beforeEach(() => {
        pipe = new PagePipe();
    });

    it('debería transformar un string numérico a entero', () => {
        const result = pipe.transform('3');
        expect(result).toBe(3);
    });

    it('debería lanzar BadRequestException si no es un número', () => {
        expect(() => pipe.transform('abc')).toThrowError(
            new BadRequestException('El parámetro "page" debe ser un número entero.'),
        );
    });

    it('debería lanzar BadRequestException si el número es negativo', () => {
        expect(() => pipe.transform('-1')).toThrowError(
            new BadRequestException('El parámetro "page" no puede ser negativo.'),
        );
    });

    it('debería aceptar el valor cero como válido', () => {
        const result = pipe.transform('0');
        expect(result).toBe(0);
    });

    it('debería lanzar excepción si se pasa null o undefined', () => {
        expect(() => pipe.transform(null)).toThrow(BadRequestException);
        expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
    });
});