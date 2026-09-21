import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(
      new BadRequestException({
        success: false,
        message: 'Hanya file gambar (jpg, png, webp) yang diperbolehkan.',
      }),
      false,
    );
  }
  cb(null, true);
};

@ApiTags('Upload Media')
@Controller('upload')
export class UploadController {
  @Post('image')
  @ApiOperation({ summary: 'Upload foto ruang kerja / banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        success: false,
        message: 'File gambar wajib diunggah.',
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      success: true,
      message: 'Foto berhasil diunggah.',
      filename: file.filename,
      url: fileUrl,
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload foto avatar member (alias)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        success: false,
        message: 'File avatar wajib diunggah.',
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      success: true,
      message: 'Avatar berhasil diunggah.',
      filename: file.filename,
      url: fileUrl,
    };
  }

  @Post('spaces')
  @ApiOperation({ summary: 'Admin Space: Upload Foto Ruangan / Meja Space' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadSpaces(@UploadedFile() file: Express.Multer.File) {
    return this.uploadImage(file);
  }

  @Post('members')
  @ApiOperation({ summary: 'User/Admin: Upload Foto Profil Member / Pelanggan' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  uploadMembers(@UploadedFile() file: Express.Multer.File) {
    return this.uploadAvatar(file);
  }
}
