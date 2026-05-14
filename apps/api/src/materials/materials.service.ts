import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ListMaterialsDto } from './dto/list-materials.dto';

@Injectable()
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(companyId: string, dto: CreateMaterialDto) {
    const qrCode = `EG${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    return this.prisma.material.create({
      data: { ...dto, companyId, qrCode },
    });
  }

  async findAll(companyId: string, query: ListMaterialsDto) {
    const { status, category, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(status && { status }),
      ...(category && { category }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { photos: { where: { isPrimary: true }, take: 1 } },
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { photos: true },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async update(companyId: string, id: string, dto: UpdateMaterialDto) {
    await this.findOne(companyId, id);
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<void> {
    await this.findOne(companyId, id);
    await this.prisma.material.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByQrCode(companyId: string, qrCode: string) {
    const material = await this.prisma.material.findFirst({
      where: { qrCode, companyId, deletedAt: null },
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async addPhoto(
    companyId: string,
    materialId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    isPrimary: boolean,
  ) {
    await this.findOne(companyId, materialId);

    if (isPrimary) {
      await this.prisma.materialPhoto.updateMany({
        where: { materialId },
        data: { isPrimary: false },
      });
    }

    const key = await this.storage.upload(buffer, originalName, mimeType, 'materials');
    const url = this.storage.getPublicUrl(key);

    return this.prisma.materialPhoto.create({
      data: { materialId, storageUrl: url, isPrimary },
    });
  }

  async removePhoto(companyId: string, materialId: string, photoId: string): Promise<void> {
    await this.findOne(companyId, materialId);
    const photo = await this.prisma.materialPhoto.findFirst({
      where: { id: photoId, materialId },
    });
    if (!photo) throw new NotFoundException('Photo not found');

    // extract key from url and delete from storage
    const key = photo.storageUrl.split(`/${process.env.MINIO_BUCKET}/`)[1];
    if (key) await this.storage.delete(key);

    await this.prisma.materialPhoto.delete({ where: { id: photoId } });
  }
}
