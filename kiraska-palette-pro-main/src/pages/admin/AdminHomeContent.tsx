import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';

const homeSections = [
  {
    title: 'Hero Banner',
    fields: [
      { key: 'hero_title', label: 'Sarlavha', description: 'hero_title' },
      { key: 'hero_subtitle', label: 'Qo\'shimcha sarlavha', description: 'hero_subtitle' },
      { key: 'hero_description', label: 'Tavsif', description: 'hero_description' },
      { key: 'hero_button_text', label: 'Tugma matni', description: 'hero_button_text' },
    ],
  },
  {
    title: 'Kategoriyalar',
    fields: [
      { key: 'categories_title', label: 'Sarlavha', description: 'categories_title' },
      { key: 'categories_subtitle', label: 'Tavsif', description: 'categories_subtitle' },
    ],
  },
  {
    title: 'Bestsellers',
    fields: [
      { key: 'bestsellers_title', label: 'Sarlavha', description: 'bestsellers_title' },
      { key: 'bestsellers_subtitle', label: 'Tavsif', description: 'bestsellers_subtitle' },
      { key: 'bestsellers_view_all', label: 'Barchasini ko\'rish tugmasi', description: 'bestsellers_view_all' },
    ],
  },
  {
    title: 'CTA Section',
    fields: [
      { key: 'cta_title', label: 'Sarlavha', description: 'cta_title' },
      { key: 'cta_description', label: 'Tavsif', description: 'cta_description' },
      { key: 'cta_button_text', label: 'Tugma matni', description: 'cta_button_text' },
    ],
  },
  {
    title: 'Navbar',
    fields: [
      { key: 'navbar_home', label: 'Bosh sahifa', description: 'navbar_home' },
      { key: 'navbar_catalog', label: 'Katalog', description: 'navbar_catalog' },
      { key: 'navbar_products', label: 'Mahsulotlar', description: 'navbar_products' },
      { key: 'navbar_about', label: 'Biz haqimizda', description: 'navbar_about' },
      { key: 'navbar_contact', label: 'Aloqa', description: 'navbar_contact' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footer_about_title', label: 'Biz haqimizda sarlavhasi', description: 'footer_about_title' },
      { key: 'footer_about_text', label: 'Biz haqimizda matni', description: 'footer_about_text' },
      { key: 'footer_links_title', label: 'Havolalar sarlavhasi', description: 'footer_links_title' },
      { key: 'footer_contact_title', label: 'Aloqa sarlavhasi', description: 'footer_contact_title' },
      { key: 'footer_copyright', label: 'Mualliflik huquqi', description: 'footer_copyright' },
    ],
  },
];

export default function AdminHomeContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bosh sahifa kontenti</h1>
          <p className="text-muted-foreground">
            Bosh sahifadagi barcha matnlarni tahrirlash
          </p>
        </div>

        <SiteContentEditor sections={homeSections} />
      </div>
    </AdminLayout>
  );
}
