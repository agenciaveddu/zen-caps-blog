import { config, fields, collection } from '@keystatic/core'

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Zen Caps Blog' },
  },
  collections: {
    blog: collection({
      label: 'Artigos',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Título do artigo' } }),
        publishedAt: fields.date({
          label: 'Data de publicação',
          defaultValue: { kind: 'today' },
        }),
        excerpt: fields.text({
          label: 'Resumo (aparece nos cards e no Google)',
          multiline: true,
          validation: { length: { max: 200 } },
        }),
        category: fields.select({
          label: 'Categoria',
          options: [
            { label: 'Sono & Insônia', value: 'sono' },
            { label: 'Ansiedade & Estresse', value: 'ansiedade' },
            { label: 'Ingredientes & Ciência', value: 'ingredientes' },
            { label: 'Hábitos Saudáveis', value: 'habitos' },
          ],
          defaultValue: 'sono',
        }),
        focusKeyword: fields.text({
          label: 'Palavra-chave principal (ex: como dormir melhor)',
        }),
        seoTitle: fields.text({
          label: 'Título SEO (máx 60 caracteres — deixe em branco para usar o título)',
          validation: { length: { max: 60 } },
        }),
        seoDescription: fields.text({
          label: 'Meta description (máx 160 caracteres — deixe em branco para usar o resumo)',
          multiline: true,
          validation: { length: { max: 160 } },
        }),
        coverImage: fields.image({
          label: 'Imagem de capa',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        content: fields.markdoc({
          label: 'Conteúdo do artigo',
        }),
      },
    }),
  },
})
