import "dotenv/config"
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CustomersRepository } from "./customers.repository.js";
import argon2 from "argon2";

export type RegisterCustomerInput = {
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
};

export type UpdateCustomerInput = {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
};

const PEPPER = Buffer.from(process.env.PASSWORD_PEPPER || "", 'utf-8');

@Injectable()
export class CustomersService {
    constructor(private readonly customersRepository: CustomersRepository) {}

    // Rote plumbing: Merchant views paginated customer list for their store
    async getCustomers(storeId: number, userId: number, limit = 20, offset = 0) {
        const store = await this.customersRepository.getStore(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }
        if (store.ownerUserId !== userId) {
            throw new ForbiddenException("You are not authorized to view customers of this store");
        }

        return await this.customersRepository.findManyByStore(storeId, limit, offset);
    }

    // Rote plumbing: Get single customer by ID
    async getCustomerById(storeId: number, customerId: number) {
        const customer = await this.customersRepository.findCustomerById(storeId, customerId);
        if (!customer) {
            throw new NotFoundException("Customer not found");
        }
        return customer;
    }

    // --- Decision-Heavy / Multi-Tenancy Methods Below ---

    async registerCustomer(storeId: number, input: RegisterCustomerInput) {
        // 1. Verify store exists (404 if not)
        const store = await this.customersRepository.getStore(storeId);
        if(!store){
            throw new NotFoundException("Store not found.")
        }
        // 2. Normalize email (trim, lowercase)
        const normalizedEmail = input.email.trim().toLowerCase()
        // 3. Check scoped uniqueness (is email already taken within THIS store?)
        const existingCustomer = await this.customersRepository.findCustomerByEmail(storeId,normalizedEmail)

        if(existingCustomer){
            throw new BadRequestException("Email already exists in this store")
        }
        //    (Remember: Alice can exist in Store 1 and Store 2, but not twice in Store 1)
        // 4. Create customer via repository
        if(input.password){
            input.password = await argon2.hash(input.password,{
                type: argon2.argon2id,
                secret: PEPPER
            })
        }       
        
        const customer = await this.customersRepository.createCustomer(storeId, {
            name: input.name,
            email: normalizedEmail,
            phone: input.phone,
            address: input.address,
            passwordHash: input.password || null
        })
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
        }
    }

    async updateCustomer(storeId: number, customerId: number, input: UpdateCustomerInput) {
        // TODO: Challenge 2 for user:
        // 1. Verify store exists (404)
        const store = await this.customersRepository.getStore(storeId)
        if(!store ){
            throw new NotFoundException("Store not found")
        }
        // 2. Verify customer exists under this storeId (404)
        const existingCustomer = await this.customersRepository.findCustomerById(storeId, customerId)
        if(!existingCustomer){
            throw new NotFoundException("Customer not found")
        }
        // 3. If email changed: normalize and check if another customer in this store already uses it (400)
        if(input.email){
            const normalizedEmail = input.email.trim().toLowerCase()
            const existingCustomer = await this.customersRepository.findCustomerByEmail(storeId,normalizedEmail)
            if(existingCustomer && existingCustomer.id !== customerId){
                throw new BadRequestException("Email already exists in this store")
            }
        }
        // 4. Update via repository
        if(input.email){
            input.email = input.email.trim().toLowerCase()
        }
        if(input.phone){
            input.phone = input.phone.trim()
        }
        if(input.address){
            input.address = input.address.trim()
        }
        if(input.name){
            input.name = input.name.trim()
        }
        const updatedCustomer = await this.customersRepository.updateCustomer(storeId, customerId, input)
        return {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
        }
    }
}
