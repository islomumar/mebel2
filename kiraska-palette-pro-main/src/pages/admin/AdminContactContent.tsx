import { AdminLayout } from '@/components/admin/AdminLayout';
import { SiteContentEditor } from '@/components/admin/SiteContentEditor';
import { MapLocationEditor } from '@/components/admin/MapLocationEditor';

const contactSections = [
  {
    title: 'Hero qismi',
    fields: [
      { key: 'contact_hero_title', label: 'Sarlavha', description: 'contact_hero_title' },
      { key: 'contact_hero_description', label: 'Tavsif', description: 'contact_hero_description' },
    ],
  },
  {
    title: 'Forma',
    fields: [
      { key: 'contact_form_title', label: 'Forma sarlavhasi', description: 'contact_form_title' },
      { key: 'contact_form_name_label', label: 'Ism maydoni', description: 'contact_form_name_label' },
      { key: 'contact_form_phone_label', label: 'Telefon maydoni', description: 'contact_form_phone_label' },
      { key: 'contact_form_message_label', label: 'Xabar maydoni', description: 'contact_form_message_label' },
      { key: 'contact_form_submit', label: 'Tugma matni', description: 'contact_form_submit' },
    ],
  },
  {
    title: 'Aloqa ma\'lumotlari',
    fields: [
      { key: 'contact_phone_title', label: 'Telefon sarlavhasi', description: 'contact_phone_title' },
      { key: 'contact_email_title', label: 'Email sarlavhasi', description: 'contact_email_title' },
      { key: 'contact_address_title', label: 'Manzil sarlavhasi', description: 'contact_address_title' },
      { key: 'contact_hours_title', label: 'Ish vaqti sarlavhasi', description: 'contact_hours_title' },
    ],
  },
  {
    title: 'Boshqa',
    fields: [
      { key: 'contact_social_title', label: 'Ijtimoiy tarmoqlar sarlavhasi', description: 'contact_social_title' },
      { key: 'contact_map_title', label: 'Xarita sarlavhasi', description: 'contact_map_title' },
    ],
  },
];

export default function AdminContactContent() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Aloqa sahifasi kontenti</h1>
          <p className="text-muted-foreground">
            Aloqa sahifasidagi barcha matnlarni tahrirlash
          </p>
        </div>

        {/* Map Location Editor */}
        <MapLocationEditor />

        {/* Text Content Editor */}
        <SiteContentEditor sections={contactSections} />
      </div>
    </AdminLayout>
  );
}
