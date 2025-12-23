import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';

const productsSections = [
  {
    title: 'Hero qismi',
    fields: [
      { key: 'products_hero_title', label: 'Sarlavha', description: 'products_hero_title' },
      { key: 'products_hero_description', label: 'Tavsif', description: 'products_hero_description' },
    ],
  },
  {
    title: 'Filtrlar',
    fields: [
      { key: 'products_filter_category', label: 'Kategoriya filtri sarlavhasi', description: 'products_filter_category' },
      { key: 'products_filter_all', label: 'Barchasi tugmasi', description: 'products_filter_all' },
      { key: 'products_sort_label', label: 'Saralash yorlig\'i', description: 'products_sort_label' },
    ],
  },
  {
    title: 'Mahsulot kartasi',
    fields: [
      { key: 'products_add_to_cart', label: 'Savatga qo\'shish tugmasi', description: 'products_add_to_cart' },
      { key: 'products_out_of_stock', label: 'Sotuvda yo\'q matni', description: 'products_out_of_stock' },
      { key: 'products_no_results', label: 'Mahsulot topilmadi', description: 'products_no_results' },
    ],
  },
];

export default function AdminProductsContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mahsulotlar sahifasi kontenti</h1>
          <p className="text-muted-foreground">
            Mahsulotlar sahifasidagi barcha matnlarni tahrirlash
          </p>
        </div>

        <SiteContentEditor sections={productsSections} />
      </div>
    </AdminLayout>
  );
}
