import { env } from '@/config/environment';
import { IProductRepository } from '@/repositories/interfaces/IProductRepository';
import { ICategoryRepository } from '@/repositories/interfaces/ICategoryRepository';
import { IOrderRepository } from '@/repositories/interfaces/IOrderRepository';
import { ISaleRepository } from '@/repositories/interfaces/ISaleRepository';
import { IInventoryRepository } from '@/repositories/interfaces/IInventoryRepository';
import { ICommunicationRepository } from '@/repositories/interfaces/ICommunicationRepository';

import { JsonProductRepository } from '@/repositories/json/JsonProductRepository';
import { JsonCategoryRepository } from '@/repositories/json/JsonCategoryRepository';
import { JsonOrderRepository } from '@/repositories/json/JsonOrderRepository';
import { JsonSaleRepository } from '@/repositories/json/JsonSaleRepository';
import { JsonInventoryRepository } from '@/repositories/json/JsonInventoryRepository';
import { JsonCommunicationRepository } from '@/repositories/json/JsonCommunicationRepository';

import { SupabaseProductRepository } from '@/repositories/supabase/SupabaseProductRepository';
import { SupabaseCategoryRepository } from '@/repositories/supabase/SupabaseCategoryRepository';
import { SupabaseOrderRepository } from '@/repositories/supabase/SupabaseOrderRepository';
import { SupabaseSaleRepository } from '@/repositories/supabase/SupabaseSaleRepository';
import { SupabaseInventoryRepository } from '@/repositories/supabase/SupabaseInventoryRepository';
import { SupabaseCommunicationRepository } from '@/repositories/supabase/SupabaseCommunicationRepository';

// Singletons for JSON
const jsonProductRepo = new JsonProductRepository();
const jsonCategoryRepo = new JsonCategoryRepository();
const jsonOrderRepo = new JsonOrderRepository();
const jsonSaleRepo = new JsonSaleRepository();
const jsonInventoryRepo = new JsonInventoryRepository();
const jsonCommunicationRepo = new JsonCommunicationRepository();

// Singletons for Supabase
const supabaseProductRepo = new SupabaseProductRepository();
const supabaseCategoryRepo = new SupabaseCategoryRepository();
const supabaseOrderRepo = new SupabaseOrderRepository();
const supabaseSaleRepo = new SupabaseSaleRepository();
const supabaseInventoryRepo = new SupabaseInventoryRepository();
const supabaseCommunicationRepo = new SupabaseCommunicationRepository();

export function getProductRepository(): IProductRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseProductRepo;
  }
  return jsonProductRepo;
}

export function getCategoryRepository(): ICategoryRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseCategoryRepo;
  }
  return jsonCategoryRepo;
}

export function getOrderRepository(): IOrderRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseOrderRepo;
  }
  return jsonOrderRepo;
}

export function getSaleRepository(): ISaleRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseSaleRepo;
  }
  return jsonSaleRepo;
}

export function getInventoryRepository(): IInventoryRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseInventoryRepo;
  }
  return jsonInventoryRepo;
}

export function getCommunicationRepository(): ICommunicationRepository {
  if (env.dataProvider === 'supabase') {
    return supabaseCommunicationRepo;
  }
  return jsonCommunicationRepo;
}
