# TODO — Zen Caps

## ⚙️ WORKFLOW DE GIT (economia de Vercel Build Minutes)

**REGRA NOVA (a partir de 19/04):** Não commitar direto em master durante desenvolvimento.

| Branch | Quando usar | Resultado no Vercel |
|--------|------------|---------------------|
| `dev` | Trabalho em features, debug, testes | **Preview Deploy** (não conta production) |
| `master` | Apenas features prontas e validadas | Production Deploy (1 build) |

### Fluxo recomendado:
```bash
git checkout dev                           # trabalha aqui
# ... muitos commits de fix, debug, etc
git push origin dev                        # gera preview, custo zero
# valida preview URL
git checkout master
git merge dev                              # squash se quiser
git push origin master                     # 1 build em produção
```

### Configurações Vercel sugeridas:
- Settings → Git → adicionar regra "Production Branch: master" (já é default)
- Settings → Git → "Ignored Build Step" se houver flutuação de imagens/conteúdo

---

## 🔴 Bloqueado pelo cliente (segunda 20/04)

### Campanha Dormant — 3 links de oferta
**Quem:** Bruno · **Quando:** segunda 20/04
**O que falta:**
- [ ] Criar páginas de checkout pras 3 ofertas:
  - Plano Experiência: 2 potes + 1 grátis
  - Plano Completo (⭐ MAIS POPULAR): 3 potes + 2 grátis
  - Melhor Custo (🔥): 5 potes + 4 grátis
- [ ] Gerar links definitivos

**Quando os links chegarem, fazer:**
1. `UPDATE campaigns SET email_body = REPLACE(REPLACE(REPLACE(email_body, '{LINK_2POTES}', '...'), '{LINK_3POTES}', '...'), '{LINK_5POTES}', '...')) WHERE id='5f9760b8-643b-4ea7-b1c5-94d6e9022335'`
2. Disparar preview pra `agenciaveddu@gmail.com` via `/api/campaigns/send-test/`
3. Bruno valida → iniciar aquecimento gradual:
   - **Dia 1:** 50 emails (2.5%) → **Dia 2:** 200 → **Dia 3:** 500 → **Dia 4:** 1000 → **Dia 5:** restante ~270

---

## 🟡 Próximas etapas (em paralelo)

### Pendentes do CRM
- [ ] Push da branch `feat/email-insights` no repo CRM (criar Preview Deploy → testar → merge)
- [ ] Atualizar Settings → Email Marketing: substituir "Resend" (legado, não usado) por status da integração AWS SES (region, configuration_set, identities verificadas, quota disponível)
- [ ] Em Settings → WhatsApp: validar se a integração já está funcional ou também é legado
- [ ] Avaliar se o "Agente IA" (Anthropic Claude) está sendo usado ou também é template inicial

### Pode esperar
- [ ] Importar 9k leads restantes do Braip (Bruno baixa CSV → eu importo)
- [ ] Integração WhatsApp (tabelas conversations/messages do CRM)
- [ ] Agente AI (agent_config já tem persona)
- [ ] Automação de redes sociais (Instagram Graph API)

---

## ✅ Concluído

### Pipeline de captura de leads via quiz
- ✅ Quizzes (3) integrados ao Supabase via `/blog/api/quiz-lead/`
- ✅ Sequências de boas-vindas (3 emails por quiz, total 9) — disparo automático com follow-up
- ✅ Cron envia automaticamente a cada 10min
- ✅ Auto-enfileiramento da próxima sequência após sucesso

### Campanhas via CRM
- ✅ Sistema de campanhas via CRM (`campaigns` + `campaign_contacts`)
- ✅ Endpoint `/api/campaigns/populate/` (popula contatos por segment)
- ✅ Cron `/api/cron/send-campaigns/` (a cada 15min)
- ✅ Endpoint `/api/campaigns/send-test/` (preview com tracking real)

### Compliance + Tracking
- ✅ Compliance LGPD: unsubscribe HMAC + landing `/blog/descadastrar/` + List-Unsubscribe RFC 8058
- ✅ Service role key Supabase (bypass RLS)
- ✅ Tracking de **abertura** via pixel 1×1 (`/blog/api/track/open/`)
- ✅ Tracking de **clique** via 302 redirect (`/blog/api/track/go/`)
- ✅ Webhook SNS para eventos SES (bounce/complaint/delivery) → opt-out automático
- ✅ X-SES-CONFIGURATION-SET integrado em todos os envios

### Métricas
- ✅ 4 VIEWs Postgres: `view_campaign_stats`, `view_sequence_stats`, `view_deliverability_health`, `view_lead_journey`
- ✅ Dashboard `/email-insights` integrado no CRM (Next.js)

### Validações
- ✅ Campanha VIP enviada (6 clientes recent — sent_count=6, completed)
- ✅ Email de teste padrão: agenciaveddu@gmail.com (Bruno Teste)
- ✅ Tracking validado end-to-end (open=130s, click=137s após envio)
