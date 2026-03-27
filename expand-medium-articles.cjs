/**
 * expand-medium-articles.cjs
 * Expande 6 artigos de 800-1300 palavras para 1800+ palavras.
 * Injeta novas seções ANTES de "## Artigos Relacionados".
 */

const fs = require('fs')
const path = require('path')
const BLOG_DIR = path.join(__dirname, 'src/content/blog')

// Cada entrada: slug → bloco de markdown a injetar antes de "## Artigos Relacionados"
const INJECTIONS = {

  // ─────────────────────────────────────────────
  // 1. MEDITAÇÃO PARA INSÔNIA (+900 palavras)
  // ─────────────────────────────────────────────
  'meditacao-para-insonia-como-praticar': `
## Script Guiado: Body Scan de 15 Minutos

Para quem está começando, ter um roteiro mental ajuda a não "perder o fio". Siga este script mentalmente ou em voz baixa:

**0–2 min — Ancoragem**
Deite-se de costas, braços ao longo do corpo, pernas levemente abertas. Feche os olhos. Respire naturalmente 3 vezes, observando o ar entrar pelo nariz e sair pela boca. Não force nada.

**2–5 min — Pés e pernas**
Leve a atenção para os dedos do pé esquerdo. Sem mover, apenas observe — há formigamento? Temperatura? Pressão? Não avalie: apenas note. Suba lentamente pelo peito do pé, tornozelo, panturrilha, joelho, coxa. Repita no lado direito.

**5–8 min — Pelve, abdômen e peito**
Observe o quadril apoiado na cama. Sinta o peso. Mova a atenção para o abdômen — perceba-o subindo e descendo a cada respiração. Passe pelo peito, observando a expansão ao inspirar.

**8–11 min — Mãos, braços e ombros**
Atenção para os dedos das mãos — há tensão? Solte conscientemente. Suba pelo antebraço, cotovelo, ombros. Muitas pessoas guardam estresse no trapézio; ao notar tensão, expire e imagine-a dissolvendo.

**11–14 min — Pescoço, rosto e couro cabeludo**
Observe a garganta, mandíbula (está fechada com força?), bochechas, sobrancelhas, testa, couro cabeludo. Solte o maxilar conscientemente.

**14–15 min — Corpo inteiro**
Expanda a consciência para o corpo inteiro como uma unidade. Perceba o peso total apoiado. Deixe os pensamentos passarem como nuvens — sem segurá-los.

Se adormecer no meio do processo, perfeito — foi bem-sucedido.

![Meditação body scan antes de dormir — ilustração 3D serena](/images/blog/inline-meditacao-body-scan-3d.webp)

## Erros Comuns (e Como Evitar)

**"Minha mente não para"** — Isso é normal e não significa falha. A meditação não é esvaziar a mente; é notar que a mente divagou e gentilmente retornar ao corpo. Cada retorno é um "rep" de atenção plena.

**"Fico com mais ansiedade tentando meditar"** — Acontece com cerca de 15% das pessoas. Solução: comece com técnicas de atenção focada (contar respirações, 4-7-8) antes do body scan. O sistema nervoso precisa se habituar progressivamente.

**"Preciso de silêncio absoluto"** — Não. Ruído branco, chuva ou sons da natureza são compatíveis. Sons que variam muito (música com letra, TV) competem com a atenção.

**"Pratico há 3 dias e não melhorei"** — Estudos mostram efeitos consistentes após **8 semanas de prática regular** (20 min/dia). Benefícios pontuais aparecem mais cedo, mas a reestruturação neural leva tempo.

## Quanto Tempo e Com Que Frequência

| Objetivo | Duração Mínima | Frequência | Tempo Para Resultados |
|---|---|---|---|
| Adormecer mais rápido | 10–15 min/sessão | Noturno, diário | 2–4 semanas |
| Reduzir despertares noturnos | 20 min/sessão | Diário | 6–8 semanas |
| Melhora estrutural do sono | 30–45 min/sessão | Diário | 8–12 semanas |
| Manutenção | 10–20 min/sessão | 5x/semana | Contínuo |

A consistência supera a duração. 10 minutos toda noite supera 1 hora ocasionalmente.

## Meditação + Suplementação: Protocolo Combinado

A meditação e a suplementação atuam em vias complementares:

- **Meditação** → reduz cortisol, ativa parassimpático, treina o sistema nervoso
- **Magnésio** → ativa receptores GABA fisicamente, favorece ondas delta
- **Triptofano** → fornece substrato para serotonina e melatonina
- **Melatonina** → sinaliza ao relógio biológico que é hora de dormir

**Protocolo sugerido:**
1. 21h30: tomar magnésio + triptofano (ou [Zen Caps →](https://zencaps.com.br))
2. 22h: iniciar body scan ou NSDR por 15–20 min
3. 22h20: luzes apagadas, quarto em escuridão total

O [Zen Caps →](https://zencaps.com.br) combina os três ativos em dose calibrada para este protocolo.
`,

  // ─────────────────────────────────────────────
  // 2. INSÔNIA CRÔNICA (+650 palavras)
  // ─────────────────────────────────────────────
  'insonia-cronica-causas-e-tratamentos': `
## TCC-I em Detalhe: As 5 Técnicas Que Funcionam

A **Terapia Cognitivo-Comportamental para Insônia (TCC-I)** é recomendada como tratamento de primeira linha pela Academia Americana de Medicina do Sono (AASM) — acima de medicamentos. Ela age em 5 frentes:

### 1. Restrição do Sono
A técnica mais eficaz e contraintuitiva: comprimir temporariamente a janela de sono para consolidá-lo. Se você passa 9h na cama e dorme 5h efetivas, a TCC-I reduz o tempo na cama para 5h30 — criando pressão homeostática que aprofunda o sono. Gradualmente a janela é expandida conforme a eficiência melhora.

**Resultado típico:** em 4–6 semanas, eficiência do sono sobe de 55% para 85–90%.

### 2. Controle do Estímulo
Recondiciona o cérebro a associar a cama com sono — não com vigília ansiosa:
- Usar a cama apenas para dormir e sexo
- Se não adormecer em 20 min, levantar e ir para outro ambiente
- Retornar quando sentir sonolência real
- Acordar sempre no mesmo horário, mesmo após noite ruim

### 3. Higiene do Sono Avançada
Além das regras básicas, inclui:
- Exposição à luz solar entre 6h–8h (calibra o relógio circadiano)
- Temperatura do quarto 18–20°C
- Eliminar relógio visível do quarto (verificar horas piora a ansiedade)
- Protocolo de "descompressão" 60 min antes de dormir

### 4. Reestruturação Cognitiva
Identifica e desafia crenças disfuncionais sobre o sono:
- *"Se não dormir 8h, amanhã será um desastre"* → evidências mostram que 1 noite ruim tem impacto mínimo no desempenho
- *"Nunca vou conseguir dormir normalmente"* → insônia crônica responde bem ao tratamento em 70–80% dos casos
- *"Acordar à noite é anormal"* → todos acordam 5–15x por noite; o problema é a ativação cognitiva ao acordar

### 5. Técnicas de Relaxamento
Integra práticas como relaxamento muscular progressivo, respiração diafragmática e NSDR — especialmente úteis para o hiperarousal fisiológico.

## Autodiagnóstico: Você Tem Insônia Crônica?

O critério diagnóstico oficial (DSM-5) é:

| Critério | Detalhe |
|---|---|
| Frequência | ≥ 3 noites/semana |
| Duração | ≥ 3 meses |
| Impacto diurno | Fadiga, humor, desempenho comprometidos |
| Contexto adequado | Mesmo com tempo e ambiente para dormir |
| Não explicada | Por outro transtorno ou substância |

Se você marca todos esses critérios, está diante de insônia crônica clinicamente definida — e merece tratamento estruturado, não apenas "dicas de sono".

## O Paradoxo do Esforço: Por Que Tentar Dormir Piora

Dormir é um processo involuntário. Quanto mais você tenta forçá-lo, mais o sistema nervoso ativa. Isso cria um ciclo cruel:

**Preocupação com o sono → ativação cortical → dificuldade para adormecer → mais preocupação**

A solução contraintuitiva da TCC-I é a **intenção paradoxal**: em vez de tentar dormir, foque em ficar acordado com os olhos fechados. Remove a pressão de performance, reduz a ativação ansiosa e, paradoxalmente, facilita o adormecimento.

O [Zen Caps →](https://zencaps.com.br) com melatonina, triptofano e magnésio suporta o protocolo de TCC-I ao criar as condições bioquímicas para o sono — sem criar dependência.
`,

  // ─────────────────────────────────────────────
  // 3. QUANTO TEMPO DORMIR (+900 palavras)
  // ─────────────────────────────────────────────
  'quanto-tempo-preciso-dormir-por-noite': `
## Cronotipos: Por Que Cada Um Tem Um Horário Ideal

Não existe um horário de dormir universalmente correto — existe o horário certo **para o seu cronotipo**. O cronotipo é determinado geneticamente por variações no gene **PER3** e outros relógios moleculares.

| Cronotipo | % da População | Horário Natural | Pico de Energia |
|---|---|---|---|
| Matutino extremo ("cotovia") | 15–20% | Dorme 21h–22h, acorda 5h–6h | Manhã cedo |
| Matutino moderado | 30–35% | Dorme 22h–23h, acorda 6h–7h | Manhã |
| Intermediário | 30% | Dorme 23h–00h, acorda 7h–8h | Manhã-tarde |
| Vespertino moderado | 20–25% | Dorme 00h–01h, acorda 8h–9h | Tarde |
| Vespertino extremo ("coruja") | 10–15% | Dorme 01h–03h, acorda 9h–11h | Noite |

O problema: a sociedade é estruturada para cronotipos matutinos. Quem tem cronotipo vespertino acumulando privação de sono ao longo dos anos não é preguiçoso — tem um relógio biológico diferente. O **jet lag social** (diferença entre horário biológico e horário social) está associado a maior risco de obesidade, depressão e doenças metabólicas.

![Cronotipos e relógio biológico — ilustração 3D](/images/blog/inline-cronotipos-relogio-3d.webp)

## Como Calcular Seu Horário Ideal de Dormir

O segredo está nos **ciclos de 90 minutos**. Cada ciclo completo inclui sono leve, profundo e REM. Acordar no meio de um ciclo gera sonolência intensa (inércia do sono); acordar no fim de um ciclo é mais suave.

**Fórmula:**
Hora de acordar − (N ciclos × 90 min) − 15 min (para adormecer) = hora de dormir

| Acorda às | 5 ciclos (7h30) | 6 ciclos (9h) |
|---|---|---|
| 6h00 | 22h15 | 20h45 |
| 7h00 | 23h15 | 21h45 |
| 7h30 | 23h45 | 22h15 |
| 8h00 | 00h15 | 22h45 |

A maioria dos adultos funciona melhor com **5 ciclos (7h30)** — suficiente para 2–3 ciclos de sono profundo e 2–3 ciclos de REM.

## Variações Individuais: Genética e Idade

A necessidade de sono tem componente genético forte. Em estudo com gêmeos idênticos e fraternos, **44% da variância** na duração do sono foi explicada por genética. Existe uma minoria (~3% da população) com mutação no gene DEC2 que funciona plenamente com 6 horas — mas a maioria que diz "eu funciono bem com 6h" acumula déficit cognitivo sem perceber.

A necessidade também muda com a vida:

| Fase | Sono Necessário | Motivo Principal |
|---|---|---|
| Recém-nascido (0–3m) | 14–17h | Desenvolvimento neural intenso |
| Bebê (4–11m) | 12–15h | Consolidação motora e de memória |
| Criança (6–13 anos) | 9–11h | GH, sistema imune, cognição |
| Adolescente (14–17) | 8–10h | Cronotipo vespertino + crescimento |
| Adulto jovem (18–25) | 7–9h | — |
| Adulto (26–64) | 7–9h | — |
| Idoso (65+) | 7–8h | Produção de melatonina cai 50% |

## Microssonos: O Sinal de Alerta Que Poucos Reconhecem

O **microsono** é um episódio involuntário de sono de 3–15 segundos, frequentemente sem que a pessoa perceba. Ocorre quando a privação de sono é severa e o cérebro "força" a recuperação momentânea.

Sinais de microsono:
- Piscar longo e involuntário
- "Pular" trechos de uma conversa ou leitura
- Cabeça caindo enquanto assiste TV ou lê
- Não lembrar dos últimos quilômetros ao dirigir

O microsono ao volante é responsável por **21% dos acidentes fatais** no Brasil, segundo o Denatran. Não é cansaço subjetivo — é falha fisiológica do sistema de vigília.

## Teste: Qual É a Sua Necessidade Real de Sono?

O teste mais confiável (sem custo):

1. Escolha um período de **2 semanas de férias ou folga**, sem compromissos matinais
2. Vá para a cama quando sentir sonolência real (não forçada)
3. Acorde sem despertador
4. Anote o total de horas nas últimas 4–5 noites (descarte as primeiras, de recuperação de dívida)
5. A média das últimas 4 noites é a sua necessidade biológica real

O [Zen Caps →](https://zencaps.com.br) com melatonina e magnésio ajuda a sincronizar o ritmo circadiano e aprofundar o sono, independentemente do cronotipo — tornando cada hora dormida mais restauradora.
`,

  // ─────────────────────────────────────────────
  // 4. SINTOMAS DE FALTA DE SONO (+1000 palavras)
  // ─────────────────────────────────────────────
  'sintomas-de-falta-de-sono-no-corpo': `
## O Que Acontece Hora a Hora Sem Dormir

A privação de sono não é uniforme — seus efeitos escalam com o tempo:

| Tempo Acordado | O Que Ocorre |
|---|---|
| 17–18h | Equivale a 0,05% de álcool no sangue (limite legal de direção) |
| 20–21h | Memória de trabalho reduzida em 30%; atenção sustentada cai |
| 24h | Dificuldade de raciocínio lógico; irritabilidade intensa; alucinações leves |
| 36h | Cortisol dispara; sistema imune comprometido; dor amplificada |
| 48h | Microssonos involuntários; dificuldade de fala; déficit de memória severo |
| 72h | Alucinações complexas; impossível de suprimir o sono por vontade |

O ponto crítico: **a maioria das pessoas com privação crônica não percebe o quanto está comprometida**. O cérebro privado de sono perde a capacidade de avaliar seu próprio nível de alerta — chamado de "cegueira de desempenho".

## Teste de Privação de Sono em 2 Minutos

Responda com honestidade:

**Sinais de privação crônica:**
- [ ] Preciso de despertador toda manhã (não acordo naturalmente)
- [ ] Cochilo involuntário após almoço mesmo sem ter almoçado
- [ ] No fim de semana durmo 2+ horas a mais do que na semana
- [ ] Adormeco em menos de 5 minutos ao deitar
- [ ] Sinto necessidade de cafeína para funcionar até as 10h

**Interpretação:**
- 0–1 marcados: sem privação significativa
- 2–3 marcados: privação moderada — esteja atento
- 4–5 marcados: privação crônica — o corpo está em débito

Adormecer em menos de 5 minutos é, paradoxalmente, sinal de privação severa. Pessoas bem descansadas levam 10–20 minutos para adormecer.

![Cérebro sob privação de sono — comparativo 3D](/images/blog/inline-sintomas-privacao-cerebro-3d.webp)

## Sintomas Menos Conhecidos Que Você Talvez Não Associe ao Sono

### Açúcar e Carboidratos: A Fome do Cérebro Cansado
A privação de sono aumenta a grelina (hormônio da fome) em 28% e reduz a leptina (saciedade) em 18% — criando fome intensa, especialmente por carboidratos e doces. O córtex pré-frontal, enfraquecido pela privação, tem menos capacidade de resistir aos impulsos. Resultado: privação de sono de 1 semana leva a ganho médio de 0,9kg, segundo estudo da Universidade de Chicago (Spiegel et al., 2004).

### Pele e Envelhecimento Acelerado
O hormônio do crescimento (GH), liberado principalmente no sono profundo, é responsável pela renovação celular da pele. Estudos mostram que 3 noites consecutivas com menos de 6h aumentam:
- Manchas finas (rugas superficiais) em 30%
- Homogeneidade da cor da pele cai
- Barreira de hidratação reduzida

O conceito de "beauty sleep" tem base científica: a pele se repara predominantemente entre 22h e 2h da madrugada.

### Memória Emocional Distorcida
O sono REM (fase dos sonhos) é quando o cérebro processa as emoções do dia e "descafeiniza" as memórias — reduz a carga emocional das experiências negativas. Sem REM suficiente, eventos menores parecem catástrofes; trauma não processado; reatividade emocional dispara.

### Microbiota Intestinal Alterada
Estudos recentes (2019–2023) mostram que 2 noites de privação de sono alteram a composição da microbiota intestinal — aumentando bactérias associadas à obesidade e inflamação. A conexão intestino-cérebro é bidirecional: sono ruim altera o intestino, e intestino alterado piora o sono.

## Quanto Tempo Para Recuperar?

A boa notícia: o organismo é resiliente. Mas a recuperação não é instantânea:

| Tipo de Privação | Recuperação Cognitiva | Recuperação Imune | Recuperação Metabólica |
|---|---|---|---|
| 1 noite ruim | 1–2 noites boas | 3–4 noites | 3–5 dias |
| 1 semana de 6h/noite | 1–2 semanas | 2–3 semanas | 2–4 semanas |
| 1 mês de privação | 3–4 semanas | 4–6 semanas | 1–2 meses |
| Privação crônica (anos) | Parcialmente irreversível | Melhora com tratamento | Melhora com tratamento |

O dano ao hipocampo (memória) causado por privação crônica pode ser parcialmente irreversível — mais um motivo para agir antes de acumular dívida por anos.

O [Zen Caps →](https://zencaps.com.br) com melatonina, magnésio e triptofano suporta a recuperação do ciclo sono-vigília e aprofunda as fases restauradoras do sono.
`,

  // ─────────────────────────────────────────────
  // 5. MAGNÉSIO (+1050 palavras)
  // ─────────────────────────────────────────────
  'magnesio-para-sono-e-ansiedade': `
## Deficiência de Magnésio no Brasil: Um Problema Silencioso

Estima-se que **60–70% da população brasileira** não atinge a ingestão diária recomendada de magnésio (400mg para homens, 310mg para mulheres). As razões são estruturais:

- **Solo empobrecido**: décadas de monocultura e uso de fertilizantes NPK (sem magnésio) reduziram o teor mineral dos alimentos
- **Processamento**: o refino do trigo remove 85% do magnésio; o da cana-de-açúcar remove 99%
- **Água filtrada/tratada**: remove minerais naturais
- **Cafeína e álcool**: aumentam a excreção renal de magnésio
- **Estresse crônico**: eleva o cortisol, que aumenta a excreção urinária de magnésio — criando um ciclo: estresse → perde magnésio → mais estresse

O problema é que o exame de sangue padrão **não detecta** a deficiência. Apenas 1% do magnésio corporal está no sangue; 99% está nos ossos, músculos e células. O exame sérico pode ser normal mesmo com deficiência celular grave.

## Os Tipos de Magnésio: Qual Escolher Para Cada Objetivo

| Forma | Biodisponibilidade | Melhor Para | Efeito Laxante |
|---|---|---|---|
| Magnésio glicina | Alta | Sono, ansiedade, relaxamento muscular | Mínimo |
| Magnésio malato | Alta | Energia, fibromialgia, dor muscular | Mínimo |
| Magnésio taurato | Alta | Sistema cardiovascular, hipertensão | Mínimo |
| Magnésio L-treonato | Muito alta (cruza BHE) | Cognição, memória, neuroproteção | Mínimo |
| Magnésio citrato | Moderada | Constipação, uso geral | Moderado |
| Magnésio óxido | Baixa (4%) | Pouco eficaz — evitar | Alto |
| Magnésio sulfato | Baixa via oral | Uso IV hospitalar, banho relaxante | Alto |

**Para sono e ansiedade**: o **magnésio glicina** é o mais estudado e recomendado. A glicina — o aminoácido ligado ao magnésio — é por si só um neurotransmissor inibitório que favorece o sono e reduz a temperatura corporal central.

![Tipos de magnésio e biodisponibilidade — gráfico 3D](/images/blog/inline-magnesio-tipos-3d.webp)

## Evidências Científicas: O Que os Estudos Mostram

**Meta-análise de 2021** (Nutrients Journal): revisão de 9 ensaios clínicos randomizados mostrou que suplementação de magnésio melhorou significativamente:
- Tempo para adormecer: −17 min em média
- Eficiência do sono: +2,2% (estatisticamente significativo)
- Tempo acordado após início do sono: −8 min
- Concentrações de melatonina: +46% vs. placebo

**Estudo de Abbasi et al. (2012)**: 46 idosos com insônia receberam 500mg de magnésio por 8 semanas. Resultados:
- Score de insônia (ISI) reduziu de 16,5 para 11,7 (melhora de 29%)
- Melatonina sérica aumentou significativamente
- Cortisol matinal reduziu 20%

**Pesquisa de Boyle et al. (2017)**: meta-análise de 18 estudos sobre magnésio e ansiedade mostrou que suplementação foi eficaz para ansiedade subjetiva, especialmente em pessoas com deficiência comprovada.

## Alimentos Ricos em Magnésio: Tabela Completa

| Alimento | Magnésio (mg/100g) | Porção Prática |
|---|---|---|
| Semente de abóbora | 534mg | 30g = 160mg |
| Farelo de trigo | 611mg | 30g = 183mg |
| Amêndoas | 270mg | 30g = 81mg |
| Castanha de caju | 292mg | 30g = 88mg |
| Espinafre cozido | 87mg | 100g = 87mg |
| Feijão preto | 60mg | 100g = 60mg |
| Aveia | 177mg | 50g = 89mg |
| Banana | 27mg | 1 unidade = 32mg |
| Chocolate amargo 70% | 228mg | 30g = 68mg |
| Salmão | 30mg | 100g = 30mg |

Para atingir 400mg via alimentação seria necessário: 30g amêndoas + 100g espinafre + 50g aveia + 30g sementes de abóbora — todos no mesmo dia. Na prática, a maioria não chega perto.

## Protocolo de Suplementação

**Dose:** 200–400mg de magnésio elementar por dia
**Forma recomendada:** glicina ou malato (melhor absorção, menos efeito laxante)
**Horário:** 30–60 minutos antes de dormir (aproveita o pico de atividade GABAérgica noturna)
**Forma:** com água; evitar com refeição muito rica em fitatos (grãos integrais em excesso) que reduzem absorção

**Quanto tempo para sentir efeito:**
- Relaxamento muscular: 1–3 dias
- Melhora do sono: 1–2 semanas
- Redução de ansiedade: 4–8 semanas de uso consistente

**Segurança:** magnésio oral é muito seguro — o excesso é excretado pelos rins. Cuidado em insuficiência renal grave (consulte médico).

## Combinação Sinérgica: Magnésio + Triptofano + Melatonina

Isolado, o magnésio melhora a qualidade do sono. Combinado com triptofano e melatonina, atua em três vias simultâneas:

| Componente | Via | Efeito |
|---|---|---|
| Magnésio | GABA → relaxamento neural | Induz sono profundo (N3) |
| Triptofano | Serotonina → melatonina | Sincroniza relógio circadiano |
| Melatonina | Receptores MT1/MT2 | Sinaliza início do sono |

O [Zen Caps →](https://zencaps.com.br) combina os três em formulação equilibrada para agir sinergicamente — estratégia mais completa do que suplementar cada um isoladamente.
`,

  // ─────────────────────────────────────────────
  // 6. SUPLEMENTOS PARA ANSIEDADE (+1050 palavras)
  // ─────────────────────────────────────────────
  'suplementos-naturais-para-ansiedade': `
## Protocolos de Dosagem: Como Tomar Cada Suplemento

A eficácia dos suplementos depende muito de dose, forma e horário. Veja o protocolo otimizado para cada um:

| Suplemento | Dose Eficaz | Forma Ideal | Horário | Onset |
|---|---|---|---|---|
| Magnésio glicinato | 200–400mg | Glicina (não óxido) | 1h antes de dormir | 1–2 sem |
| L-Triptofano | 500–1000mg | Em jejum ou com CHO | 1h antes de dormir | 2–4 sem |
| Ashwagandha | 300–600mg | KSM-66 ou Sensoril® | Manhã ou noite | 4–8 sem |
| L-Teanina | 100–200mg | Isolado ou com cafeína | Manhã ou conforme necessidade | 30–60 min |
| Valeriana | 300–600mg | Extrato padronizado | 30–60 min antes de dormir | 2–4 sem |
| Passiflora | 250–500mg | Extrato fluido ou seco | À noite | 1–2 sem |
| Vitamina B6 (P-5-P) | 25–50mg | Piridoxal-5-fosfato | Manhã com alimentos | 2–6 sem |

**Observação sobre L-Teanina:** é o único suplemento desta lista com efeito agudo mensurável (30–60 min). Pode ser usada antes de situações de estresse pontual (apresentação, prova, reunião difícil).

## Stacking: Combinações Que Potencializam os Efeitos

Alguns suplementos funcionam melhor em combinação do que isolados:

**Stack para sono + ansiedade noturna:**
- Magnésio glicinato (200–300mg) + L-Triptofano (500mg) + Melatonina (0,5–1mg)
- Horário: 45–60 min antes de dormir
- Sinergia: magnésio ativa GABA, triptofano fornece substrato para melatonina, melatonina sincroniza o ritmo

**Stack para ansiedade diurna + foco:**
- L-Teanina (100–200mg) + Vitamina B6 (25mg) + Magnésio (100–200mg)
- Horário: manhã com café ou chá verde
- Sinergia: teanina modula glutamato/GABA, B6 apoia serotonina, magnésio suporta sistema nervoso

**Stack para ansiedade crônica + adaptação ao estresse:**
- Ashwagandha KSM-66 (300mg) + Magnésio (200mg) + B6 (25mg)
- Horário: noite com refeição
- Sinergia: ashwagandha regula cortisol, magnésio e B6 são cofatores para neurotransmissores

![Combinações de suplementos para ansiedade — diagrama 3D](/images/blog/inline-suplementos-ansiedade-stack-3d.webp)

## Interações Importantes: O Que Evitar

**Triptofano / 5-HTP + ISRS ou IMAO:**
Risco de síndrome serotoninérgica — potencialmente grave. Nunca combine sem orientação médica. Espere pelo menos 2 semanas após suspender ISRS antes de iniciar triptofano.

**Valeriana + benzodiazepínicos ou álcool:**
Efeito sedativo aditivo — pode causar sedação excessiva. Evite combinação.

**Ashwagandha + medicamentos tireoidianos:**
Ashwagandha pode elevar T3 e T4. Em pessoas com hipotireoidismo medicado, monitorar função tireoidiana.

**L-Teanina + ansiolíticos prescritos:**
Potencializa o efeito — ajuste de dose pode ser necessário.

**Regra geral:** informe seu médico sobre qualquer suplemento que estiver tomando antes de iniciar tratamento farmacológico.

## Como Avaliar Qualidade: O Que Olhar no Rótulo

O mercado de suplementos no Brasil tem produtos com eficácia muito variável. Checklist de qualidade:

**Magnésio:**
- ✅ Magnésio glicinato, malato ou L-treonato
- ❌ Magnésio óxido (biodisponibilidade de 4%)
- Verificar: mg de magnésio ELEMENTAR (não do sal)

**Ashwagandha:**
- ✅ Extrato padronizado KSM-66® ou Sensoril® (marcas registradas com estudos próprios)
- ❌ "Pó de raiz" sem padronização de witanolídeos
- Verificar: % de witanolídeos (mínimo 5%)

**Triptofano:**
- ✅ L-Triptofano de fermentação (fonte vegetal)
- Verificar: cápsulas sem excipientes desnecessários

**Certificações confiáveis:**
- NSF International
- USP Verified
- Certificado de análise de lote (COA) disponível

## Por Que Suplementos São Complementares, Não Substitutos

Suplementos naturais têm eficácia documentada, mas atuam melhor quando combinados com:

1. **Higiene do sono**: horários consistentes, quarto escuro e frio, sem telas 1h antes
2. **Exercício físico**: 30 min de aeróbico reduz cortisol basal em 15–20%
3. **Gestão cognitiva**: TCC, mindfulness ou journaling para processar pensamentos ansiosos
4. **Redução de estimulantes**: cafeína após 14h e álcool fragmentam o sono mesmo com suplementação

A suplementação "tapa o buraco" bioquímico — mas sem mudanças comportamentais, o buraco se abre novamente.

## Comparativo Final: Os 7 Suplementos em Perspectiva

| Suplemento | Evidência | Velocidade | Segurança | Melhor Para |
|---|---|---|---|---|
| Magnésio | Alta | Média | Muito alta | Sono + ansiedade geral |
| Triptofano | Moderada-alta | Lenta | Alta* | Sono + humor |
| Ashwagandha | Moderada | Lenta | Alta | Estresse crônico + cortisol |
| L-Teanina | Moderada | Rápida | Muito alta | Ansiedade pontual + foco |
| Valeriana | Baixa-moderada | Média | Alta | Insônia leve |
| Passiflora | Baixa-moderada | Média | Alta | Ansiedade noturna |
| Vitamina B6 | Moderada | Lenta | Alta | Suporte neurológico |

*Atenção em usuários de ISRS/IMAO

O [Zen Caps →](https://zencaps.com.br) combina os três suplementos com maior evidência para sono e ansiedade — magnésio, triptofano e melatonina — em formulação sinérgica calibrada para uso noturno.
`,
}

// ============================================================
// PROCESSAR INJEÇÕES
// ============================================================
let processed = 0

for (const [slug, injection] of Object.entries(INJECTIONS)) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Não encontrado: ${slug}`)
    continue
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Já foi injetado?
  if (content.includes('## Protocolos de Dosagem') ||
      content.includes('## Script Guiado') ||
      content.includes('## TCC-I em Detalhe') ||
      content.includes('## Cronotipos') ||
      content.includes('## O Que Acontece Hora a Hora') ||
      content.includes('## Deficiência de Magnésio no Brasil')) {
    console.log(`⏭️  ${slug} — já expandido`)
    continue
  }

  // Injetar antes de "## Artigos Relacionados"
  if (content.includes('## Artigos Relacionados')) {
    content = content.replace('## Artigos Relacionados', injection.trimStart() + '\n## Artigos Relacionados')
  } else {
    content = content.trimEnd() + '\n' + injection.trimStart()
  }

  fs.writeFileSync(filePath, content, 'utf-8')

  const body = content.split('---').slice(2).join('---')
  const words = body.trim().split(/\s+/).length
  console.log(`✅ ${slug} — ~${words} palavras de body`)
  processed++
}

console.log(`\n📊 ${processed} artigos expandidos`)
