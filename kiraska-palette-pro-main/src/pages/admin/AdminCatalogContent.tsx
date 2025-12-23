import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';

const catalogSections = [
  {
    title: 'Hero qismi',
    fields: [
      { key: 'catalog_hero_title', label: 'Sarlavha', description: 'catalog_hero_title' },
      { key: 'catalog_hero_description', label: 'Tavsif', description: 'catalog_hero_description' },
    ],
  },
  {
    title: 'Qidiruv va filter',
    fields: [
      { key: 'catalog_search_placeholder', label: 'Qidiruv placeholder', description: 'catalog_search_placeholder' },
      { key: 'catalog_filter_all', label: 'Barchasi tugmasi', description: 'catalog_filter_all' },
      { key: 'catalog_no_results', label: 'Natija topilmadi matni', description: 'catalog_no_results' },
    ],
  },
];

export default function AdminCatalogContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Katalog sahifasi kontenti</h1>
          <p className="text-muted-foreground">
            Katalog sahifasidagi barcha matnlarni tahrirlash
          </p>
        </div>

        <SiteContentEditor sections={catalogSections} />
      </div>
    </AdminLayout>
  );
}
