import { BadRequestException, Controller, Get, Param, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Controlador encargado de manejar las requests relativas a los usuarios
 */

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {

  /**
   * Inyecta el servicio de Users
   * @param usersService Servicio que contiene la logica de negocio de Users
   */
  constructor(private readonly usersService: UsersService) { }

  /**
   * Devuelve todos los usuarios
   * 
   * @returns 
   */
  @Role('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Devuelve el usuario con el ID especificado
   * 
   * @param id ID del usuario a buscar
   * @returns 
   */
  @Role('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /** 
   * Cambia la imagen de perfil del usuario
   * 
   * @param req el objeto de la request de HTML
   * @param file archivo con formato de imagen
   * @returns 
   */
  @Patch('profile-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadProfileImage(@Req() req, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo de imagen.');
    }

    const userId = req.user['id'];
    const imageUrl = `/uploads/${file.filename}`;
    return this.usersService.updateProfileImage(userId, imageUrl);
  }
}