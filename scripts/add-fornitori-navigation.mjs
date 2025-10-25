import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORNITORI_PAGES = [
  { path: 'catering', title: '🍽️ Catering & Banqueting', name: 'Catering' },
  { path: 'fotografi', title: '📸 Fotografi', name: 'Fotografi' },
  { path: 'fiorai', title: '💐 Fiorai', name: 'Fiorai' },
  { path: 'beauty', title: '💄 Make-up & Beauty', name: 'Make-up & Beauty' },
  { path: 'gioiellerie', title: '💍 Gioiellerie', name: 'Gioiellerie' },
  { path: 'wedding-planner', title: '📋 Wedding Planner', name: 'Wedding Planner' },
  { path: 'musica-cerimonia', title: '🎵 Musica Cerimonia', name: 'Musica Cerimonia' },
  { path: 'musica-ricevimento', title: '🎶 Musica Ricevimento', name: 'Musica Ricevimento' },
];

const breadcrumbTemplate = (name) => `      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-[#A3B59D] transition-colors">
          🏠 Home
        </Link>
        <span>›</span>
        <Link href="/fornitori" className="hover:text-[#A3B59D] transition-colors">
          Fornitori
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">${name}</span>
      </nav>

      {/* Header con bottone Torna a Fornitori */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
`;

const backButtonTemplate = `        </div>
        <Link
          href="/fornitori"
          className="ml-4 px-4 py-2 bg-white border-2 border-[#A3B59D] text-[#A3B59D] rounded-lg hover:bg-[#A3B59D] hover:text-white transition-colors font-semibold text-sm whitespace-nowrap"
        >
          ← Tutti i Fornitori
        </Link>
      </div>
`;

for (const page of FORNITORI_PAGES) {
  const filePath = path.join(__dirname, '..', 'src', 'app', page.path, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File non trovato: ${page.path}/page.tsx`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Aggiungi import Link se non presente
  if (!content.includes('import Link from "next/link"')) {
    content = content.replace(
      /^("use client";?\s*\n)/m,
      '$1\nimport Link from "next/link";\n'
    );
  }

  // Trova e sostituisci il titolo con breadcrumb + header
  const titleRegex = new RegExp(
    `(  return \\([\\s\\S]*?<section className="pt-6">)[\\s\\S]*?(<h2.*?${page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</h2>\\s*<p.*?</p>)`,
    'm'
  );

  if (titleRegex.test(content)) {
    content = content.replace(titleRegex, (match, before, titleBlock) => {
      return before + '\n' + breadcrumbTemplate(page.name) + titleBlock.replace(/mb-6/, '') + backButtonTemplate;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Aggiornato: ${page.path}/page.tsx`);
  } else {
    console.log(`❌ Pattern non trovato in: ${page.path}/page.tsx`);
  }
}

console.log('\n✨ Fatto! Tutte le pagine fornitori aggiornate.');
