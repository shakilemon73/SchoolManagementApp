export interface BangladeshIDTemplate {
  id: string;
  name: string;
  nameInBangla: string;
  description: string;
  previewImage?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  features: string[];
  layout: 'portrait' | 'landscape';
  tags: string[];
}

export const bangladeshIDTemplates: BangladeshIDTemplate[] = [
  // Standard School Template
  {
    id: 'standard-school',
    name: 'Standard School',
    nameInBangla: 'স্ট্যান্ডার্ড স্কুল',
    description: 'Traditional design used by most government schools in Bangladesh',
    previewImage: 'standard-school-template.png',
    colors: {
      primary: '#006A4E', // Bangladesh flag green
      secondary: '#00796B',
      accent: '#F42A41', // Bangladesh flag red
      background: '#ffffff',
      text: '#263238'
    },
    features: ['Watermark', 'QR code', 'Standard dimensions'],
    layout: 'portrait',
    tags: ['standard', 'government', 'school']
  },
  
  // Modern Design
  {
    id: 'modern-school',
    name: 'Modern School',
    nameInBangla: 'আধুনিক স্কুল',
    description: 'Contemporary design popular in private schools in Bangladesh',
    previewImage: 'modern-school-template.png',
    colors: {
      primary: '#1565C0',
      secondary: '#0D47A1',
      accent: '#FFC107',
      background: '#ffffff',
      text: '#212121'
    },
    features: ['QR code', 'Hologram area', 'Parent contact info'],
    layout: 'landscape',
    tags: ['modern', 'private', 'school']
  },
  
  // Madrasa Template
  {
    id: 'madrasa-traditional',
    name: 'Madrasa Traditional',
    nameInBangla: 'মাদ্রাসা ট্র্যাডিশনাল',
    description: 'Traditional design used by madrasas in Bangladesh',
    previewImage: 'madrasa-template.png',
    colors: {
      primary: '#004D40',
      secondary: '#00352c',
      accent: '#4CAF50',
      background: '#f5f5f5',
      text: '#212121'
    },
    features: ['Bismillah text', 'Arabic script support', 'Traditional styling'],
    layout: 'portrait',
    tags: ['madrasa', 'islamic', 'traditional']
  },
  
  // College Template
  {
    id: 'college-professional',
    name: 'College Professional',
    nameInBangla: 'কলেজ প্রফেশনাল',
    description: 'Professional design used by colleges in Bangladesh',
    previewImage: 'college-template.png',
    colors: {
      primary: '#3949AB',
      secondary: '#303F9F',
      accent: '#FF5722',
      background: '#ffffff',
      text: '#212121'
    },
    features: ['Photo watermark', 'Bidi text support', 'Education board logo'],
    layout: 'landscape',
    tags: ['college', 'professional', 'education-board']
  },
  
  // University Template
  {
    id: 'university-modern',
    name: 'University Modern',
    nameInBangla: 'বিশ্ববিদ্যালয় আধুনিক',
    description: 'Contemporary design used by leading universities in Bangladesh',
    previewImage: 'university-template.png',
    colors: {
      primary: '#4527a0',
      secondary: '#673ab7',
      accent: '#ffc107',
      background: '#ffffff',
      text: '#212121'
    },
    features: ['NFC chip compatible', 'Advanced security features', 'Faculty color coding'],
    layout: 'portrait',
    tags: ['university', 'modern', 'advanced']
  },
  
  // Primary School Colorful
  {
    id: 'primary-colorful',
    name: 'Primary School Colorful',
    nameInBangla: 'প্রাথমিক স্কুল কালারফুল',
    description: 'Colorful design optimized for primary school children',
    previewImage: 'primary-colorful.png',
    colors: {
      primary: '#FF5722',
      secondary: '#FF8A65',
      accent: '#4CAF50',
      background: '#FFECB3',
      text: '#212121'
    },
    features: ['Child-friendly design', 'Emergency contact info', 'Larger text'],
    layout: 'portrait',
    tags: ['primary', 'colorful', 'children']
  },
  
  // Technical School
  {
    id: 'technical-school',
    name: 'Technical School',
    nameInBangla: 'টেকনিক্যাল স্কুল',
    description: 'Professional design for technical and vocational schools',
    previewImage: 'technical-template.png',
    colors: {
      primary: '#455A64',
      secondary: '#37474F',
      accent: '#FF5722',
      background: '#ECEFF1',
      text: '#263238'
    },
    features: ['Department color coding', 'Workshop access indicators', 'Technical certification level'],
    layout: 'landscape',
    tags: ['technical', 'vocational', 'professional']
  },
  
  // Special Education
  {
    id: 'special-education',
    name: 'Special Education',
    nameInBangla: 'বিশেষ শিক্ষা',
    description: 'Accessible design for special education institutions',
    previewImage: 'special-ed-template.png',
    colors: {
      primary: '#00BCD4',
      secondary: '#0097A7',
      accent: '#FFEB3B',
      background: '#ffffff',
      text: '#212121'
    },
    features: ['High contrast', 'Braille compatible', 'Larger font sizes'],
    layout: 'landscape',
    tags: ['special-education', 'accessible', 'inclusive']
  },
  
  // BRAC School Template
  {
    id: 'brac-school',
    name: 'BRAC School',
    nameInBangla: 'ব্র্যাক স্কুল',
    description: 'Authentic template used by BRAC schools in rural Bangladesh',
    previewImage: 'brac-school.png',
    colors: {
      primary: '#00A651', // BRAC green
      secondary: '#007939',
      accent: '#E31B23', // BRAC red
      background: '#ffffff',
      text: '#333333'
    },
    features: ['Rural community info', 'Guardian photo', 'Emergency health information'],
    layout: 'portrait',
    tags: ['brac', 'ngo', 'rural']
  },
  
  // English Medium School
  {
    id: 'english-medium',
    name: 'English Medium Premium',
    nameInBangla: 'ইংলিশ মিডিয়াম প্রিমিয়াম',
    description: 'Premium design used by leading English medium schools in Dhaka',
    previewImage: 'english-medium.png',
    colors: {
      primary: '#18246C',
      secondary: '#111A4D',
      accent: '#BE9D56', // Gold accent
      background: '#ffffff',
      text: '#18246C'
    },
    features: ['Embossed school emblem', 'Parent QR code login', 'Premium PVC card'],
    layout: 'landscape',
    tags: ['english-medium', 'premium', 'international']
  },
  
  // Digital School ID
  {
    id: 'digital-school',
    name: 'Digital School Smart ID',
    nameInBangla: 'ডিজিটাল স্কুল স্মার্ট আইডি',
    description: 'Modern digital ID with smart features for tech-savvy schools',
    previewImage: 'digital-school.png',
    colors: {
      primary: '#4285F4', // Google blue
      secondary: '#3367D6',
      accent: '#FBBC05', // Google yellow
      background: '#ffffff',
      text: '#000000'
    },
    features: ['App QR integration', 'Digital attendance', 'Library access code'],
    layout: 'portrait',
    tags: ['digital', 'smart', 'modern']
  },
  
  // Cantonment Public School
  {
    id: 'cantonment-school',
    name: 'Cantonment Public School',
    nameInBangla: 'ক্যান্টনমেন্ট পাবলিক স্কুল',
    description: 'Official design used by cantonment public schools throughout Bangladesh',
    previewImage: 'cantonment-school.png',
    colors: {
      primary: '#14325C',
      secondary: '#0A1F3D',
      accent: '#BF9850',
      background: '#ffffff',
      text: '#14325C'
    },
    features: ['Military-grade security features', 'Defense service family code', 'Official seal'],
    layout: 'portrait',
    tags: ['cantonment', 'military', 'official']
  },
  
  // Bangla Medium Classic
  {
    id: 'bangla-medium-classic',
    name: 'Bangla Medium Classic',
    nameInBangla: 'বাংলা মিডিয়াম ক্লাসিক',
    description: 'Classic design used by traditional Bangla medium schools',
    previewImage: 'bangla-medium-classic.png',
    colors: {
      primary: '#0C4DA2',
      secondary: '#083A7D',
      accent: '#F42A41',
      background: '#F8F9FA',
      text: '#212121'
    },
    features: ['Bengali script focus', 'Traditional education board emblem', 'Class information'],
    layout: 'portrait',
    tags: ['bangla-medium', 'traditional', 'classic']
  },
  
  // Urban Kindergarten
  {
    id: 'urban-kindergarten',
    name: 'Urban Kindergarten',
    nameInBangla: 'আরবান কিন্ডারগার্টেন',
    description: 'Playful and bright design for kindergarten and pre-primary schools in urban areas',
    previewImage: 'urban-kindergarten.png',
    colors: {
      primary: '#FF4081',
      secondary: '#F50057',
      accent: '#2196F3',
      background: '#FFFDE7',
      text: '#212121'
    },
    features: ['Parent pickup code', 'Allergen information', 'Fun child-friendly design'],
    layout: 'landscape',
    tags: ['kindergarten', 'pre-primary', 'child-friendly']
  },
  
  // Cadet College
  {
    id: 'cadet-college',
    name: 'Cadet College',
    nameInBangla: 'ক্যাডেট কলেজ',
    description: 'Official format used by prestigious cadet colleges in Bangladesh',
    previewImage: 'cadet-college.png',
    colors: {
      primary: '#192F5D',
      secondary: '#101D3D',
      accent: '#AF9500',
      background: '#ffffff',
      text: '#000000'
    },
    features: ['House identification', 'Rank insignia', 'Security hologram'],
    layout: 'portrait',
    tags: ['cadet', 'military', 'prestigious']
  }
];

export function getTemplateById(id: string): BangladeshIDTemplate {
  return bangladeshIDTemplates.find(template => template.id === id) || bangladeshIDTemplates[0];
}