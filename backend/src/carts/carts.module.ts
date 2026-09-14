import { Module } from "@nestjs/common";
import { CartsController } from "./carts.controller.js";
import { CartsService } from "./carts.service.js";
import { CartsRepository } from "./carts.repository.js";

@Module({
    controllers: [CartsController],
    providers: [CartsService, CartsRepository],
    exports: [CartsService, CartsRepository],
})
export class CartsModule {}
