import { useLanguage, Language } from '@/contexts/LanguageContext';

type TranslationKeys = {
  // Common
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.create': string;
  'common.loading': string;
  'common.saving': string;
  'common.deleting': string;
  'common.uploading': string;
  'common.success': string;
  'common.error': string;
  'common.active': string;
  'common.inactive': string;
  'common.status': string;
  'common.actions': string;
  'common.preview': string;
  'common.notSelected': string;
  'common.selectCategory': string;
  'common.url': string;
  'common.upload': string;
  'common.selectImage': string;
  'common.noImage': string;
  'common.back': string;

  // Admin Categories
  'admin.categories.title': string;
  'admin.categories.subtitle': string;
  'admin.categories.new': string;
  'admin.categories.edit': string;
  'admin.categories.list': string;
  'admin.categories.notFound': string;
  'admin.categories.deleteTitle': string;
  'admin.categories.deleteDescription': string;
  'admin.categories.activated': string;
  'admin.categories.deactivated': string;
  'admin.categories.created': string;
  'admin.categories.updated': string;
  'admin.categories.deleted': string;
  'admin.categories.loadError': string;
  'admin.categories.saveError': string;
  'admin.categories.deleteError': string;
  'admin.categories.statusError': string;

  // Admin Products
  'admin.products.title': string;
  'admin.products.subtitle': string;
  'admin.products.new': string;
  'admin.products.edit': string;
  'admin.products.notFound': string;
  'admin.products.created': string;
  'admin.products.updated': string;
  'admin.products.saveError': string;

  // Form Labels
  'form.name': string;
  'form.slug': string;
  'form.description': string;
  'form.shortDescription': string;
  'form.fullDescription': string;
  'form.price': string;
  'form.oldPrice': string;
  'form.category': string;
  'form.brand': string;
  'form.volume': string;
  'form.colorName': string;
  'form.image': string;
  'form.imageUrl': string;
  'form.activeStatus': string;
  'form.stockQuantity': string;
  'form.lowStockThreshold': string;
  'form.inStock': string;
  'form.featured': string;
  'form.bestseller': string;

  // Form Placeholders
  'placeholder.enterName': string;
  'placeholder.enterDescription': string;
  'placeholder.enterUrl': string;

  // Form Hints
  'hint.slugRequired': string;
  'hint.nameRequired': string;
  'hint.priceRequired': string;
  'hint.lowStockWarning': string;
  'hint.inStockActive': string;
  'hint.inStockInactive': string;
  'hint.activeOnSite': string;
  'hint.inactiveOnSite': string;
  'hint.featuredHint': string;
  'hint.bestsellerHint': string;
  'hint.fallbackText': string;

  // Form Sections
  'section.basicInfo': string;
  'section.pricing': string;
  'section.stockManagement': string;
  'section.image': string;
  'section.description': string;
  'section.categoryImage': string;

  // Image Upload
  'image.uploadError': string;
  'image.typeError': string;
  'image.sizeError': string;
  'image.uploadSuccess': string;
};

const translations: Record<Language, TranslationKeys> = {
  uz: {
    // Common
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.delete': "O'chirish",
    'common.edit': 'Tahrirlash',
    'common.create': "Qo'shish",
    'common.loading': 'Yuklanmoqda...',
    'common.saving': 'Saqlanmoqda...',
    'common.deleting': "O'chirilmoqda...",
    'common.uploading': 'Yuklanmoqda...',
    'common.success': 'Muvaffaqiyat',
    'common.error': 'Xatolik',
    'common.active': 'Faol',
    'common.inactive': 'Nofaol',
    'common.status': 'Holati',
    'common.actions': 'Amallar',
    'common.preview': "Ko'rib chiqish",
    'common.notSelected': 'Tanlanmagan',
    'common.selectCategory': 'Kategoriya tanlang',
    'common.url': 'URL',
    'common.upload': 'Yuklash',
    'common.selectImage': 'Rasm tanlash',
    'common.noImage': 'Rasm tanlanmagan',
    'common.back': 'Orqaga',

    // Admin Categories
    'admin.categories.title': 'Kategoriyalar',
    'admin.categories.subtitle': 'Barcha kategoriyalarni boshqarish',
    'admin.categories.new': 'Yangi kategoriya',
    'admin.categories.edit': 'Kategoriyani tahrirlash',
    'admin.categories.list': "Kategoriyalar ro'yxati",
    'admin.categories.notFound': 'Kategoriyalar topilmadi',
    'admin.categories.deleteTitle': "Kategoriyani o'chirish",
    'admin.categories.deleteDescription': "Haqiqatan ham bu kategoriyani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
    'admin.categories.activated': 'Kategoriya faollashtirildi',
    'admin.categories.deactivated': "Kategoriya o'chirildi",
    'admin.categories.created': "Kategoriya muvaffaqiyatli qo'shildi",
    'admin.categories.updated': 'Kategoriya muvaffaqiyatli yangilandi',
    'admin.categories.deleted': "Kategoriya muvaffaqiyatli o'chirildi",
    'admin.categories.loadError': 'Kategoriyalarni yuklashda xatolik yuz berdi',
    'admin.categories.saveError': 'Kategoriyani saqlashda xatolik yuz berdi',
    'admin.categories.deleteError': "Kategoriyani o'chirishda xatolik yuz berdi",
    'admin.categories.statusError': "Holatni o'zgartirishda xatolik yuz berdi",

    // Admin Products
    'admin.products.title': 'Mahsulotlar',
    'admin.products.subtitle': 'Barcha mahsulotlarni boshqarish',
    'admin.products.new': 'Yangi mahsulot',
    'admin.products.edit': 'Mahsulotni tahrirlash',
    'admin.products.notFound': 'Mahsulot topilmadi',
    'admin.products.created': "Mahsulot muvaffaqiyatli qo'shildi",
    'admin.products.updated': 'Mahsulot muvaffaqiyatli yangilandi',
    'admin.products.saveError': 'Mahsulotni saqlashda xatolik yuz berdi',

    // Form Labels
    'form.name': 'Nomi',
    'form.slug': 'Slug',
    'form.description': 'Tavsif',
    'form.shortDescription': 'Qisqa tavsif',
    'form.fullDescription': "To'liq tavsif",
    'form.price': 'Narxi',
    'form.oldPrice': 'Eski narxi',
    'form.category': 'Kategoriya',
    'form.brand': 'Brend',
    'form.volume': 'Hajmi',
    'form.colorName': 'Rang nomi',
    'form.image': 'Rasm',
    'form.imageUrl': 'Rasm URL',
    'form.activeStatus': 'Faol holati',
    'form.stockQuantity': 'Zaxira miqdori',
    'form.lowStockThreshold': 'Kam zaxira chegarasi',
    'form.inStock': 'Mavjud',
    'form.featured': 'Featured',
    'form.bestseller': 'Bestseller',

    // Form Placeholders
    'placeholder.enterName': 'Nom kiriting',
    'placeholder.enterDescription': 'Tavsif kiriting',
    'placeholder.enterUrl': 'https://example.com/image.jpg',

    // Form Hints
    'hint.slugRequired': 'Slug kiritilishi shart',
    'hint.nameRequired': 'Nom kiritilishi shart',
    'hint.priceRequired': 'Narx 0 dan kam bo\'lmasligi kerak',
    'hint.lowStockWarning': "Zaxira bu miqdordan kam bo'lganda ogohlantirish ko'rsatiladi",
    'hint.inStockActive': 'Mahsulot sotuvda',
    'hint.inStockInactive': 'Mahsulot mavjud emas',
    'hint.activeOnSite': "Saytda ko'rsatiladi",
    'hint.inactiveOnSite': "Saytda ko'rsatilmaydi",
    'hint.featuredHint': "Bosh sahifada ko'rsatiladi",
    'hint.bestsellerHint': "Eng ko'p sotilgan deb belgilanadi",
    'hint.fallbackText': "Bo'sh qoldirilsa, O'zbekcha matn ko'rsatiladi",

    // Form Sections
    'section.basicInfo': "Asosiy ma'lumotlar",
    'section.pricing': 'Narx',
    'section.stockManagement': 'Zaxira boshqaruvi',
    'section.image': 'Rasm',
    'section.description': 'Tavsif',
    'section.categoryImage': 'Kategoriya rasmi',

    // Image Upload
    'image.uploadError': 'Rasmni yuklashda xatolik yuz berdi',
    'image.typeError': 'Faqat JPG, PNG, WEBP va GIF formatlarida rasm yuklash mumkin',
    'image.sizeError': 'Rasm hajmi 5MB dan oshmasligi kerak',
    'image.uploadSuccess': 'Rasm muvaffaqiyatli yuklandi',
  },
  ky: {
    // Common
    'common.save': 'Сактоо',
    'common.cancel': 'Жокко чыгаруу',
    'common.delete': 'Өчүрүү',
    'common.edit': 'Түзөтүү',
    'common.create': 'Кошуу',
    'common.loading': 'Жүктөлүүдө...',
    'common.saving': 'Сакталууда...',
    'common.deleting': 'Өчүрүлүүдө...',
    'common.uploading': 'Жүктөлүүдө...',
    'common.success': 'Ийгилик',
    'common.error': 'Ката',
    'common.active': 'Активдүү',
    'common.inactive': 'Активдүү эмес',
    'common.status': 'Абал',
    'common.actions': 'Аракеттер',
    'common.preview': 'Алдын ала көрүү',
    'common.notSelected': 'Тандалган эмес',
    'common.selectCategory': 'Категория тандаңыз',
    'common.url': 'URL',
    'common.upload': 'Жүктөө',
    'common.selectImage': 'Сүрөт тандоо',
    'common.noImage': 'Сүрөт тандалган эмес',
    'common.back': 'Артка',

    // Admin Categories
    'admin.categories.title': 'Категориялар',
    'admin.categories.subtitle': 'Бардык категорияларды башкаруу',
    'admin.categories.new': 'Жаңы категория',
    'admin.categories.edit': 'Категорияны түзөтүү',
    'admin.categories.list': 'Категориялар тизмеси',
    'admin.categories.notFound': 'Категориялар табылган жок',
    'admin.categories.deleteTitle': 'Категорияны өчүрүү',
    'admin.categories.deleteDescription': 'Бул категорияны чын эле өчүргүңүз келеби? Бул аракетти кайтаруу мүмкүн эмес.',
    'admin.categories.activated': 'Категория активдештирилди',
    'admin.categories.deactivated': 'Категория өчүрүлдү',
    'admin.categories.created': 'Категория ийгиликтүү кошулду',
    'admin.categories.updated': 'Категория ийгиликтүү жаңыланды',
    'admin.categories.deleted': 'Категория ийгиликтүү өчүрүлдү',
    'admin.categories.loadError': 'Категорияларды жүктөөдө ката кетти',
    'admin.categories.saveError': 'Категорияны сактоодо ката кетти',
    'admin.categories.deleteError': 'Категорияны өчүрүүдө ката кетти',
    'admin.categories.statusError': 'Абалды өзгөртүүдө ката кетти',

    // Admin Products
    'admin.products.title': 'Продукциялар',
    'admin.products.subtitle': 'Бардык продукцияларды башкаруу',
    'admin.products.new': 'Жаңы продукция',
    'admin.products.edit': 'Продукцияны түзөтүү',
    'admin.products.notFound': 'Продукция табылган жок',
    'admin.products.created': 'Продукция ийгиликтүү кошулду',
    'admin.products.updated': 'Продукция ийгиликтүү жаңыланды',
    'admin.products.saveError': 'Продукцияны сактоодо ката кетти',

    // Form Labels
    'form.name': 'Аты',
    'form.slug': 'Slug',
    'form.description': 'Сүрөттөмө',
    'form.shortDescription': 'Кыска сүрөттөмө',
    'form.fullDescription': 'Толук сүрөттөмө',
    'form.price': 'Баасы',
    'form.oldPrice': 'Эски баасы',
    'form.category': 'Категория',
    'form.brand': 'Бренд',
    'form.volume': 'Көлөмү',
    'form.colorName': 'Түс аты',
    'form.image': 'Сүрөт',
    'form.imageUrl': 'Сүрөт URL',
    'form.activeStatus': 'Активдүү абал',
    'form.stockQuantity': 'Запас саны',
    'form.lowStockThreshold': 'Аз запас чеги',
    'form.inStock': 'Бар',
    'form.featured': 'Featured',
    'form.bestseller': 'Bestseller',

    // Form Placeholders
    'placeholder.enterName': 'Атын киргизиңиз',
    'placeholder.enterDescription': 'Сүрөттөмө киргизиңиз',
    'placeholder.enterUrl': 'https://example.com/image.jpg',

    // Form Hints
    'hint.slugRequired': 'Slug киргизилиши керек',
    'hint.nameRequired': 'Аты киргизилиши керек',
    'hint.priceRequired': 'Баа 0дон аз болбошу керек',
    'hint.lowStockWarning': 'Запас бул санчадан аз болгондо эскертүү көрсөтүлөт',
    'hint.inStockActive': 'Продукция сатылууда',
    'hint.inStockInactive': 'Продукция жок',
    'hint.activeOnSite': 'Сайтта көрсөтүлөт',
    'hint.inactiveOnSite': 'Сайтта көрсөтүлбөйт',
    'hint.featuredHint': 'Башкы бетте көрсөтүлөт',
    'hint.bestsellerHint': 'Эң көп сатылган деп белгиленет',
    'hint.fallbackText': 'Бош калтырылса, өзбекче текст көрсөтүлөт',

    // Form Sections
    'section.basicInfo': 'Негизги маалымат',
    'section.pricing': 'Баа',
    'section.stockManagement': 'Запас башкаруу',
    'section.image': 'Сүрөт',
    'section.description': 'Сүрөттөмө',
    'section.categoryImage': 'Категория сүрөтү',

    // Image Upload
    'image.uploadError': 'Сүрөттү жүктөөдө ката кетти',
    'image.typeError': 'Сүрөт JPG, PNG, WEBP же GIF форматында болушу керек',
    'image.sizeError': 'Сүрөт өлчөмү 5MB ашпашы керек',
    'image.uploadSuccess': 'Сүрөт ийгиликтүү жүктөлдү',
  },
  tj: {
    // Common
    'common.save': 'Захира кардан',
    'common.cancel': 'Бекор кардан',
    'common.delete': 'Нест кардан',
    'common.edit': 'Таҳрир кардан',
    'common.create': 'Илова кардан',
    'common.loading': 'Бор мешавад...',
    'common.saving': 'Захира мешавад...',
    'common.deleting': 'Нест мешавад...',
    'common.uploading': 'Бор мешавад...',
    'common.success': 'Муваффақият',
    'common.error': 'Хато',
    'common.active': 'Фаъол',
    'common.inactive': 'Ғайрифаъол',
    'common.status': 'Ҳолат',
    'common.actions': 'Амалҳо',
    'common.preview': 'Пешнамоиш',
    'common.notSelected': 'Интихоб нашудааст',
    'common.selectCategory': 'Категорияро интихоб кунед',
    'common.url': 'URL',
    'common.upload': 'Боргузорӣ',
    'common.selectImage': 'Тасвир интихоб кунед',
    'common.noImage': 'Тасвир интихоб нашудааст',
    'common.back': 'Бозгашт',

    // Admin Categories
    'admin.categories.title': 'Категорияҳо',
    'admin.categories.subtitle': 'Идоракунии ҳамаи категорияҳо',
    'admin.categories.new': 'Категорияи нав',
    'admin.categories.edit': 'Таҳрири категория',
    'admin.categories.list': 'Рӯйхати категорияҳо',
    'admin.categories.notFound': 'Категорияҳо ёфт нашуданд',
    'admin.categories.deleteTitle': 'Нест кардани категория',
    'admin.categories.deleteDescription': 'Шумо мутмаинед, ки мехоҳед ин категорияро нест кунед? Ин амал баргардонида намешавад.',
    'admin.categories.activated': 'Категория фаъол шуд',
    'admin.categories.deactivated': 'Категория ғайрифаъол шуд',
    'admin.categories.created': 'Категория бомуваффақият илова шуд',
    'admin.categories.updated': 'Категория бомуваффақият навсозӣ шуд',
    'admin.categories.deleted': 'Категория бомуваффақият нест шуд',
    'admin.categories.loadError': 'Хато ҳангоми боркунии категорияҳо',
    'admin.categories.saveError': 'Хато ҳангоми захиракунии категория',
    'admin.categories.deleteError': 'Хато ҳангоми несткунии категория',
    'admin.categories.statusError': 'Хато ҳангоми тағйири ҳолат',

    // Admin Products
    'admin.products.title': 'Маҳсулотҳо',
    'admin.products.subtitle': 'Идоракунии ҳамаи маҳсулотҳо',
    'admin.products.new': 'Маҳсулоти нав',
    'admin.products.edit': 'Таҳрири маҳсулот',
    'admin.products.notFound': 'Маҳсулот ёфт нашуд',
    'admin.products.created': 'Маҳсулот бомуваффақият илова шуд',
    'admin.products.updated': 'Маҳсулот бомуваффақият навсозӣ шуд',
    'admin.products.saveError': 'Хато ҳангоми захиракунии маҳсулот',

    // Form Labels
    'form.name': 'Ном',
    'form.slug': 'Slug',
    'form.description': 'Тавсиф',
    'form.shortDescription': 'Тавсифи кӯтоҳ',
    'form.fullDescription': 'Тавсифи пурра',
    'form.price': 'Нарх',
    'form.oldPrice': 'Нархи кӯҳна',
    'form.category': 'Категория',
    'form.brand': 'Бренд',
    'form.volume': 'Ҳаҷм',
    'form.colorName': 'Номи ранг',
    'form.image': 'Тасвир',
    'form.imageUrl': 'URL тасвир',
    'form.activeStatus': 'Ҳолати фаъол',
    'form.stockQuantity': 'Миқдори захира',
    'form.lowStockThreshold': 'Ҳадди ками захира',
    'form.inStock': 'Мавҷуд',
    'form.featured': 'Featured',
    'form.bestseller': 'Bestseller',

    // Form Placeholders
    'placeholder.enterName': 'Номро ворид кунед',
    'placeholder.enterDescription': 'Тавсифро ворид кунед',
    'placeholder.enterUrl': 'https://example.com/image.jpg',

    // Form Hints
    'hint.slugRequired': 'Slug бояд ворид шавад',
    'hint.nameRequired': 'Ном бояд ворид шавад',
    'hint.priceRequired': 'Нарх набояд аз 0 кам бошад',
    'hint.lowStockWarning': 'Вақте захира аз ин миқдор кам шавад, огоҳӣ нишон дода мешавад',
    'hint.inStockActive': 'Маҳсулот дар фурӯш аст',
    'hint.inStockInactive': 'Маҳсулот мавҷуд нест',
    'hint.activeOnSite': 'Дар сайт нишон дода мешавад',
    'hint.inactiveOnSite': 'Дар сайт нишон дода намешавад',
    'hint.featuredHint': 'Дар саҳифаи асосӣ нишон дода мешавад',
    'hint.bestsellerHint': 'Ҳамчун бештар фурӯхташуда қайд мешавад',
    'hint.fallbackText': 'Агар холӣ бимонад, матни ӯзбекӣ нишон дода мешавад',

    // Form Sections
    'section.basicInfo': 'Маълумоти асосӣ',
    'section.pricing': 'Нарх',
    'section.stockManagement': 'Идоракунии захира',
    'section.image': 'Тасвир',
    'section.description': 'Тавсиф',
    'section.categoryImage': 'Тасвири категория',

    // Image Upload
    'image.uploadError': 'Хато ҳангоми боркунии тасвир',
    'image.typeError': 'Танҳо форматҳои JPG, PNG, WEBP ва GIF иҷозат дода мешаванд',
    'image.sizeError': 'Ҳаҷми тасвир набояд аз 5MB зиёд бошад',
    'image.uploadSuccess': 'Тасвир бомуваффақият бор шуд',
  },
  ru: {
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.create': 'Создать',
    'common.loading': 'Загрузка...',
    'common.saving': 'Сохранение...',
    'common.deleting': 'Удаление...',
    'common.uploading': 'Загрузка...',
    'common.success': 'Успешно',
    'common.error': 'Ошибка',
    'common.active': 'Активен',
    'common.inactive': 'Неактивен',
    'common.status': 'Статус',
    'common.actions': 'Действия',
    'common.preview': 'Предпросмотр',
    'common.notSelected': 'Не выбрано',
    'common.selectCategory': 'Выберите категорию',
    'common.url': 'URL',
    'common.upload': 'Загрузить',
    'common.selectImage': 'Выбрать изображение',
    'common.noImage': 'Изображение не выбрано',
    'common.back': 'Назад',

    // Admin Categories
    'admin.categories.title': 'Категории',
    'admin.categories.subtitle': 'Управление всеми категориями',
    'admin.categories.new': 'Новая категория',
    'admin.categories.edit': 'Редактировать категорию',
    'admin.categories.list': 'Список категорий',
    'admin.categories.notFound': 'Категории не найдены',
    'admin.categories.deleteTitle': 'Удалить категорию',
    'admin.categories.deleteDescription': 'Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.',
    'admin.categories.activated': 'Категория активирована',
    'admin.categories.deactivated': 'Категория деактивирована',
    'admin.categories.created': 'Категория успешно создана',
    'admin.categories.updated': 'Категория успешно обновлена',
    'admin.categories.deleted': 'Категория успешно удалена',
    'admin.categories.loadError': 'Ошибка при загрузке категорий',
    'admin.categories.saveError': 'Ошибка при сохранении категории',
    'admin.categories.deleteError': 'Ошибка при удалении категории',
    'admin.categories.statusError': 'Ошибка при изменении статуса',

    // Admin Products
    'admin.products.title': 'Продукты',
    'admin.products.subtitle': 'Управление всеми продуктами',
    'admin.products.new': 'Новый продукт',
    'admin.products.edit': 'Редактировать продукт',
    'admin.products.notFound': 'Продукт не найден',
    'admin.products.created': 'Продукт успешно создан',
    'admin.products.updated': 'Продукт успешно обновлён',
    'admin.products.saveError': 'Ошибка при сохранении продукта',

    // Form Labels
    'form.name': 'Название',
    'form.slug': 'Slug',
    'form.description': 'Описание',
    'form.shortDescription': 'Краткое описание',
    'form.fullDescription': 'Полное описание',
    'form.price': 'Цена',
    'form.oldPrice': 'Старая цена',
    'form.category': 'Категория',
    'form.brand': 'Бренд',
    'form.volume': 'Объём',
    'form.colorName': 'Название цвета',
    'form.image': 'Изображение',
    'form.imageUrl': 'URL изображения',
    'form.activeStatus': 'Активный статус',
    'form.stockQuantity': 'Количество на складе',
    'form.lowStockThreshold': 'Порог низкого запаса',
    'form.inStock': 'В наличии',
    'form.featured': 'Featured',
    'form.bestseller': 'Bestseller',

    // Form Placeholders
    'placeholder.enterName': 'Введите название',
    'placeholder.enterDescription': 'Введите описание',
    'placeholder.enterUrl': 'https://example.com/image.jpg',

    // Form Hints
    'hint.slugRequired': 'Slug обязателен',
    'hint.nameRequired': 'Название обязательно',
    'hint.priceRequired': 'Цена не может быть меньше 0',
    'hint.lowStockWarning': 'Предупреждение появится, когда запас станет меньше этого значения',
    'hint.inStockActive': 'Продукт в продаже',
    'hint.inStockInactive': 'Продукт недоступен',
    'hint.activeOnSite': 'Отображается на сайте',
    'hint.inactiveOnSite': 'Не отображается на сайте',
    'hint.featuredHint': 'Отображается на главной странице',
    'hint.bestsellerHint': 'Отмечен как бестселлер',
    'hint.fallbackText': 'Если оставить пустым, будет показан узбекский текст',

    // Form Sections
    'section.basicInfo': 'Основная информация',
    'section.pricing': 'Цена',
    'section.stockManagement': 'Управление запасами',
    'section.image': 'Изображение',
    'section.description': 'Описание',
    'section.categoryImage': 'Изображение категории',

    // Image Upload
    'image.uploadError': 'Ошибка при загрузке изображения',
    'image.typeError': 'Разрешены только форматы JPG, PNG, WEBP и GIF',
    'image.sizeError': 'Размер изображения не должен превышать 5MB',
    'image.uploadSuccess': 'Изображение успешно загружено',
  },
  zh: {
    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.loading': '加载中...',
    'common.saving': '保存中...',
    'common.deleting': '删除中...',
    'common.uploading': '上传中...',
    'common.success': '成功',
    'common.error': '错误',
    'common.active': '活跃',
    'common.inactive': '未活跃',
    'common.status': '状态',
    'common.actions': '操作',
    'common.preview': '预览',
    'common.notSelected': '未选择',
    'common.selectCategory': '选择分类',
    'common.url': 'URL',
    'common.upload': '上传',
    'common.selectImage': '选择图片',
    'common.noImage': '未选择图片',
    'common.back': '返回',

    // Admin Categories
    'admin.categories.title': '分类',
    'admin.categories.subtitle': '管理所有分类',
    'admin.categories.new': '新建分类',
    'admin.categories.edit': '编辑分类',
    'admin.categories.list': '分类列表',
    'admin.categories.notFound': '未找到分类',
    'admin.categories.deleteTitle': '删除分类',
    'admin.categories.deleteDescription': '您确定要删除这个分类吗？此操作无法撤销。',
    'admin.categories.activated': '分类已激活',
    'admin.categories.deactivated': '分类已停用',
    'admin.categories.created': '分类创建成功',
    'admin.categories.updated': '分类更新成功',
    'admin.categories.deleted': '分类删除成功',
    'admin.categories.loadError': '加载分类时出错',
    'admin.categories.saveError': '保存分类时出错',
    'admin.categories.deleteError': '删除分类时出错',
    'admin.categories.statusError': '更改状态时出错',

    // Admin Products
    'admin.products.title': '产品',
    'admin.products.subtitle': '管理所有产品',
    'admin.products.new': '新建产品',
    'admin.products.edit': '编辑产品',
    'admin.products.notFound': '未找到产品',
    'admin.products.created': '产品创建成功',
    'admin.products.updated': '产品更新成功',
    'admin.products.saveError': '保存产品时出错',

    // Form Labels
    'form.name': '名称',
    'form.slug': 'Slug',
    'form.description': '描述',
    'form.shortDescription': '简短描述',
    'form.fullDescription': '完整描述',
    'form.price': '价格',
    'form.oldPrice': '原价',
    'form.category': '分类',
    'form.brand': '品牌',
    'form.volume': '容量',
    'form.colorName': '颜色名称',
    'form.image': '图片',
    'form.imageUrl': '图片URL',
    'form.activeStatus': '活跃状态',
    'form.stockQuantity': '库存数量',
    'form.lowStockThreshold': '低库存阈值',
    'form.inStock': '有货',
    'form.featured': '特色',
    'form.bestseller': '畅销品',

    // Form Placeholders
    'placeholder.enterName': '输入名称',
    'placeholder.enterDescription': '输入描述',
    'placeholder.enterUrl': 'https://example.com/image.jpg',

    // Form Hints
    'hint.slugRequired': 'Slug为必填项',
    'hint.nameRequired': '名称为必填项',
    'hint.priceRequired': '价格不能小于0',
    'hint.lowStockWarning': '库存低于此值时将显示警告',
    'hint.inStockActive': '产品在售',
    'hint.inStockInactive': '产品缺货',
    'hint.activeOnSite': '在网站上显示',
    'hint.inactiveOnSite': '不在网站上显示',
    'hint.featuredHint': '在首页显示',
    'hint.bestsellerHint': '标记为畅销品',
    'hint.fallbackText': '如果留空，将显示乌兹别克语文本',

    // Form Sections
    'section.basicInfo': '基本信息',
    'section.pricing': '价格',
    'section.stockManagement': '库存管理',
    'section.image': '图片',
    'section.description': '描述',
    'section.categoryImage': '分类图片',

    // Image Upload
    'image.uploadError': '上传图片时出错',
    'image.typeError': '仅允许JPG、PNG、WEBP和GIF格式',
    'image.sizeError': '图片大小不能超过5MB',
    'image.uploadSuccess': '图片上传成功',
  },
};

export function useTranslations() {
  const { currentLanguage } = useLanguage();

  const t = (key: keyof TranslationKeys): string => {
    return translations[currentLanguage][key] || translations.uz[key] || key;
  };

  return { t, currentLanguage };
}
