import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';

const aboutSections = [
  {
    title: 'Hero qismi',
    fields: [
      { key: 'about_hero_title', label: 'Sarlavha', description: 'about_hero_title' },
      { key: 'about_hero_description', label: 'Tavsif', description: 'about_hero_description' },
    ],
  },
  {
    title: 'Asosiy qism',
    fields: [
      { key: 'about_story_title', label: 'Tarix sarlavhasi', description: 'about_story_title' },
      { key: 'about_story_text', label: 'Tarix matni', description: 'about_story_text' },
      { key: 'about_mission_title', label: 'Missiya sarlavhasi', description: 'about_mission_title' },
      { key: 'about_mission_text', label: 'Missiya matni', description: 'about_mission_text' },
    ],
  },
  {
    title: 'Statistikalar',
    fields: [
      { key: 'about_stat_years', label: 'Yillar soni', description: 'about_stat_years' },
      { key: 'about_stat_years_label', label: 'Yillar yorlig\'i', description: 'about_stat_years_label' },
      { key: 'about_stat_products', label: 'Mahsulotlar soni', description: 'about_stat_products' },
      { key: 'about_stat_products_label', label: 'Mahsulotlar yorlig\'i', description: 'about_stat_products_label' },
      { key: 'about_stat_clients', label: 'Mijozlar soni', description: 'about_stat_clients' },
      { key: 'about_stat_clients_label', label: 'Mijozlar yorlig\'i', description: 'about_stat_clients_label' },
    ],
  },
  {
    title: 'Afzalliklar',
    fields: [
      { key: 'about_advantages_title', label: 'Afzalliklar sarlavhasi', description: 'about_advantages_title' },
      { key: 'about_advantage_1_title', label: 'Afzallik 1 sarlavhasi', description: 'about_advantage_1_title' },
      { key: 'about_advantage_1_text', label: 'Afzallik 1 matni', description: 'about_advantage_1_text' },
      { key: 'about_advantage_2_title', label: 'Afzallik 2 sarlavhasi', description: 'about_advantage_2_title' },
      { key: 'about_advantage_2_text', label: 'Afzallik 2 matni', description: 'about_advantage_2_text' },
      { key: 'about_advantage_3_title', label: 'Afzallik 3 sarlavhasi', description: 'about_advantage_3_title' },
      { key: 'about_advantage_3_text', label: 'Afzallik 3 matni', description: 'about_advantage_3_text' },
    ],
  },
];

export default function AdminAboutContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biz haqimizda sahifasi kontenti</h1>
          <p className="text-muted-foreground">
            Biz haqimizda sahifasidagi barcha matnlarni tahrirlash
          </p>
        </div>

        <SiteContentEditor sections={aboutSections} />
      </div>
    </AdminLayout>
  );
}
