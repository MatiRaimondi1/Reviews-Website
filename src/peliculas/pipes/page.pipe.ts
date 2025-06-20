import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PagePipe implements PipeTransform {
    transform(value: any) {
        const page = parseInt(value, 10);

        if (isNaN(page)) {
            throw new BadRequestException('El parámetro "page" debe ser un número entero.');
        }

        if (page < 0) {
            throw new BadRequestException('El parámetro "page" no puede ser negativo.');
        }

        return page;
    }
}