/**
 * inject-links.cjs
 * Injeta links internos estratégicos em todos os artigos do blog.
 * Cada artigo recebe 3-5 links contextualmente relevantes antes das Referências.
 */

const fs = require('fs')
const path = require('path')

const BLOG_DIR = path.join(__dirname, 'src/content/blog')

// Mapa de links por artigo: slug → array de {text, slug, context}
const LINK_MAP = {
  'melatonina-como-funciona-no-corpo': [
    { text: 'A combinação de melatonina, triptofano e magnésio', slug: 'melatonina-triptofano-magnesio-sono' },
    { text: 'O triptofano como precursor da melatonina', slug: 'triptofano-para-que-serve-beneficios' },
    { text: 'Vitamina B6 e a produção de serotonina', slug: 'vitamina-b6-serotonina-e-sono' },
    { text: 'Melatonina vs Magnésio: qual tomar primeiro', slug: 'melatonina-vs-magnesio-qual-tomar-primeiro' },
  ],
  'triptofano-para-que-serve-beneficios': [
    { text: 'Como a melatonina funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Vitamina B6: cofator essencial na síntese de serotonina', slug: 'vitamina-b6-serotonina-e-sono' },
    { text: 'Magnésio para sono e ansiedade', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Melatonina, triptofano e magnésio: o que a ciência diz', slug: 'melatonina-triptofano-magnesio-sono' },
  ],
  'alimentos-que-ajudam-a-dormir-melhor': [
    { text: 'Como a melatonina é produzida e quando suplementar', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'O papel do magnésio na qualidade do sono', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Rotina noturna para dormir melhor', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Sono profundo: como conseguir mais desta fase', slug: 'sono-profundo-como-conseguir-mais' },
  ],
  'sono-profundo-como-conseguir-mais': [
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Magnésio para sono: doses e tipos', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'estresse-cronico-consequencias-para-saude': [
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Ansiedade noturna: por que piora à noite', slug: 'ansiedade-noturna-como-tratar' },
    { text: 'Técnicas de respiração para ansiedade', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Insônia crônica causada pelo estresse', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'ansiedade-noturna-como-tratar': [
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Técnicas de respiração com evidência científica', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Crise de ansiedade: protocolo de 5 minutos', slug: 'crise-de-ansiedade-agora-protocolo-5-minutos' },
    { text: 'Suplementos naturais para ansiedade', slug: 'suplementos-naturais-para-ansiedade' },
  ],
  'suplementos-naturais-para-ansiedade': [
    { text: 'Magnésio para sono e ansiedade: tipos e doses', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Vitamina B6 e serotonina: a conexão', slug: 'vitamina-b6-serotonina-e-sono' },
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Melatonina, triptofano e magnésio juntos', slug: 'melatonina-triptofano-magnesio-sono' },
  ],
  'magnesio-para-sono-e-ansiedade': [
    { text: 'Melatonina, triptofano e magnésio: o que a ciência diz', slug: 'melatonina-triptofano-magnesio-sono' },
    { text: 'Sono profundo e o papel do magnésio', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Vitamina B6 e a produção de serotonina', slug: 'vitamina-b6-serotonina-e-sono' },
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'como-relaxar-antes-de-dormir-rotina': [
    { text: 'Rotina noturna completa para dormir melhor', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Técnicas de respiração para ansiedade', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Sono profundo: como conseguir mais', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Meditação para insônia: como praticar', slug: 'meditacao-para-insonia-como-praticar' },
  ],
  'sintomas-de-falta-de-sono-no-corpo': [
    { text: 'Insônia crônica: causas, sintomas e tratamento', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'O que fazer quando não consigo dormir', slug: 'nao-consigo-dormir-o-que-fazer' },
  ],
  'quanto-tempo-preciso-dormir-por-noite': [
    { text: 'Sono profundo: a fase mais restauradora', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Sintomas de falta de sono no corpo', slug: 'sintomas-de-falta-de-sono-no-corpo' },
    { text: 'Insônia crônica e seus tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'meditacao-para-insonia-como-praticar': [
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Técnicas de respiração com evidência científica', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Relaxamento muscular progressivo para dormir', slug: 'tecnicas-de-relaxamento-muscular-para-dormir' },
  ],
  'insonia-cronica-causas-e-tratamentos': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'O que fazer quando não consigo dormir', slug: 'nao-consigo-dormir-o-que-fazer' },
    { text: 'Melatonina: como funciona e quando suplementar', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Magnésio para sono: doses e tipos', slug: 'magnesio-para-sono-e-ansiedade' },
  ],
  'crise-de-ansiedade-agora-protocolo-5-minutos': [
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Técnicas de respiração com evidência científica', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Transtorno de ansiedade generalizada: sintomas e tratamento', slug: 'ansiedade-generalizada-tratamento-natural' },
    { text: 'Ansiedade noturna: como tratar', slug: 'ansiedade-noturna-como-tratar' },
  ],
  'vitamina-b6-serotonina-e-sono': [
    { text: 'Como a melatonina funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'O papel do triptofano no sono e humor', slug: 'triptofano-para-que-serve-beneficios' },
    { text: 'Melatonina, triptofano e magnésio juntos', slug: 'melatonina-triptofano-magnesio-sono' },
    { text: 'Suplementos naturais para ansiedade', slug: 'suplementos-naturais-para-ansiedade' },
  ],
  'celular-antes-de-dormir-prejudica-sono': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Rotina noturna: 7 hábitos para dormir bem', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Como a melatonina é suprimida pela luz azul', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Sono profundo: como recuperar', slug: 'sono-profundo-como-conseguir-mais' },
  ],
  'teste-sono-saudavel-checklist-10-pontos': [
    { text: 'Insônia crônica: diagnóstico e tratamento', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Sintomas físicos da privação de sono', slug: 'sintomas-de-falta-de-sono-no-corpo' },
  ],
  'acido-folico-saude-cerebral-sono': [
    { text: 'Vitamina B6 e serotonina: a conexão', slug: 'vitamina-b6-serotonina-e-sono' },
    { text: 'Melatonina, triptofano e magnésio: o que a ciência diz', slug: 'melatonina-triptofano-magnesio-sono' },
    { text: 'Sono profundo e restauração cerebral', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Suplementos naturais para ansiedade e sono', slug: 'suplementos-naturais-para-ansiedade' },
  ],
  'melatonina-vs-magnesio-qual-tomar-primeiro': [
    { text: 'Como a melatonina funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Magnésio para sono e ansiedade: tipos e doses', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Melatonina, triptofano e magnésio juntos', slug: 'melatonina-triptofano-magnesio-sono' },
    { text: 'Insônia crônica: quando suplementar', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'dormir-cedo-beneficios-para-saude': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
    { text: 'Rotina noturna para dormir bem', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Sono profundo: a fase mais restauradora', slug: 'sono-profundo-como-conseguir-mais' },
  ],
  'melatonina-triptofano-magnesio-sono': [
    { text: 'Como a melatonina funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'O papel do triptofano no sono', slug: 'triptofano-para-que-serve-beneficios' },
    { text: 'Magnésio para sono e ansiedade: tipos e doses', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Vitamina B6: cofator na produção de serotonina', slug: 'vitamina-b6-serotonina-e-sono' },
  ],
  'cafeina-e-sono-quanto-afeta': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Rotina noturna para dormir bem', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Alimentos que ajudam a dormir', slug: 'alimentos-que-ajudam-a-dormir-melhor' },
  ],
  'como-dormir-melhor-guia-completo': [
    { text: 'Sono profundo: o que é e como conseguir mais', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Melatonina: como funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Rotina noturna: 7 hábitos essenciais', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
  ],
  'apneia-do-sono-o-que-e-sintomas': [
    { text: 'Insônia crônica: diagnóstico e tratamento', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Sono profundo: como recuperar', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Sintomas físicos da privação de sono', slug: 'sintomas-de-falta-de-sono-no-corpo' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
  ],
  'ansiedade-generalizada-tratamento-natural': [
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Técnicas de respiração com evidência científica', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Suplementos naturais para ansiedade', slug: 'suplementos-naturais-para-ansiedade' },
    { text: 'Ansiedade noturna: por que piora à noite', slug: 'ansiedade-noturna-como-tratar' },
  ],
  'exercicio-fisico-melhora-sono': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Sono profundo: como conseguir mais', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Rotina noturna para dormir bem', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
  ],
  'nao-consigo-dormir-o-que-fazer': [
    { text: 'Insônia crônica: causas e tratamentos', slug: 'insonia-cronica-causas-e-tratamentos' },
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Melatonina: como funciona e quando suplementar', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Magnésio para sono e ansiedade', slug: 'magnesio-para-sono-e-ansiedade' },
  ],
  'tecnicas-de-relaxamento-muscular-para-dormir': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Técnicas de respiração para ansiedade', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Rotina noturna: 7 hábitos essenciais', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Meditação para insônia: como praticar', slug: 'meditacao-para-insonia-como-praticar' },
  ],
  'como-acordar-disposto-sem-cansaco': [
    { text: 'Sono profundo: a fase mais restauradora', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Quanto tempo preciso dormir por noite', slug: 'quanto-tempo-preciso-dormir-por-noite' },
    { text: 'Rotina noturna para dormir bem', slug: 'rotina-noturna-para-dormir-melhor' },
    { text: 'Melatonina: como funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
  ],
  'rotina-noturna-para-dormir-melhor': [
    { text: 'Guia completo para dormir melhor', slug: 'como-dormir-melhor-guia-completo' },
    { text: 'Sono profundo: como conseguir mais', slug: 'sono-profundo-como-conseguir-mais' },
    { text: 'Melatonina: como funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'Técnicas de relaxamento muscular para dormir', slug: 'tecnicas-de-relaxamento-muscular-para-dormir' },
  ],
  'zen-caps-composicao-completa-ingredientes': [
    { text: 'Como a melatonina funciona no corpo', slug: 'melatonina-como-funciona-no-corpo' },
    { text: 'O papel do triptofano no sono e humor', slug: 'triptofano-para-que-serve-beneficios' },
    { text: 'Magnésio para sono e ansiedade: tipos e doses', slug: 'magnesio-para-sono-e-ansiedade' },
    { text: 'Vitamina B6 e serotonina: a conexão', slug: 'vitamina-b6-serotonina-e-sono' },
  ],
  'respiracao-para-ansiedade-tecnicas': [
    { text: 'Como controlar a ansiedade naturalmente', slug: 'como-controlar-ansiedade-naturalmente' },
    { text: 'Crise de ansiedade: protocolo de 5 minutos', slug: 'crise-de-ansiedade-agora-protocolo-5-minutos' },
    { text: 'Ansiedade noturna: por que piora à noite', slug: 'ansiedade-noturna-como-tratar' },
    { text: 'Meditação para insônia: como praticar', slug: 'meditacao-para-insonia-como-praticar' },
  ],
  'como-controlar-ansiedade-naturalmente': [
    { text: 'Técnicas de respiração para ansiedade', slug: 'respiracao-para-ansiedade-tecnicas' },
    { text: 'Ansiedade noturna: por que piora à noite', slug: 'ansiedade-noturna-como-tratar' },
    { text: 'Suplementos naturais para ansiedade', slug: 'suplementos-naturais-para-ansiedade' },
    { text: 'Transtorno de ansiedade generalizada', slug: 'ansiedade-generalizada-tratamento-natural' },
  ],
}

function buildRelatedSection(links) {
  const items = links
    .map(l => `- [${l.text}](/blog/${l.slug})`)
    .join('\n')
  return `\n## Artigos Relacionados\n\n${items}\n`
}

function injectLinks(content, slug) {
  const links = LINK_MAP[slug]
  if (!links) return content

  // Don't inject if already has a "Artigos Relacionados" section
  if (content.includes('## Artigos Relacionados')) return content

  const relatedSection = buildRelatedSection(links)

  // Insert before "## Referências" if exists
  if (content.includes('## Referências')) {
    return content.replace(/\n## Referências/, relatedSection + '\n## Referências')
  }

  // Otherwise append before end
  return content.trimEnd() + '\n' + relatedSection
}

let processed = 0
let skipped = 0

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

for (const file of files) {
  const slug = file.replace('.md', '')
  const filePath = path.join(BLOG_DIR, file)
  const content = fs.readFileSync(filePath, 'utf-8')

  if (!LINK_MAP[slug]) {
    console.log(`⚠️  Sem mapa de links: ${slug}`)
    skipped++
    continue
  }

  const updated = injectLinks(content, slug)

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf-8')
    const linkCount = LINK_MAP[slug].length
    console.log(`✅ ${slug} — +${linkCount} links internos`)
    processed++
  } else {
    console.log(`⏭️  ${slug} — já tem links`)
    skipped++
  }
}

console.log(`\n📊 Resultado: ${processed} artigos atualizados, ${skipped} ignorados`)
