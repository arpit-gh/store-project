import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ProductsModule } from './products/products.module.js';
import { StoresModule } from './stores/stores.module.js';
import { CategoriesModule } from './categories/categories.module.js';

@Module({
    imports: [PrismaModule, HealthModule, ProductsModule, StoresModule, CategoriesModule],
})
export class AppModule {}
