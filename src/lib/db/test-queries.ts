import { SupabaseOrderRepository } from '@/repositories/supabase/SupabaseOrderRepository';
import { SupabaseCategoryRepository } from '@/repositories/supabase/SupabaseCategoryRepository';
import { SupabaseProductRepository } from '@/repositories/supabase/SupabaseProductRepository';
import { DashboardService } from '@/services/dashboard.service';

process.env.DATABASE_URL = 'postgresql://postgres:6652278Jogf@db.ogduluwvhezpvwimffdi.supabase.co:5432/postgres';

async function main() {
  try {
    console.log('--- Testing Categories ---');
    const catRepo = new SupabaseCategoryRepository();
    const categories = await catRepo.findAll();
    console.log('Categories count:', categories.length);

    console.log('--- Testing Products ---');
    const prodRepo = new SupabaseProductRepository();
    const products = await prodRepo.findAll();
    console.log('Products count:', products.length);

    console.log('--- Testing Orders ---');
    const orderRepo = new SupabaseOrderRepository();
    const orders = await orderRepo.findAll('PENDIENTE');
    console.log('Pending orders count:', orders.length);

    console.log('--- Testing Dashboard ---');
    const dash = new DashboardService();
    const stats = await dash.getStats();
    console.log('Stats:', stats);
    const top = await dash.getTopProducts(5);
    console.log('Top products:', top);
    const chart = await dash.getSalesChart('month');
    console.log('Chart points:', chart.length);

    console.log('ALL TESTS PASSED WITH SUPABASE!');
  } catch (err) {
    console.error('FAILED WITH ERROR:', err);
  }
}

main();
