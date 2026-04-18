# TODO — Zen Caps

## 🔴 Bloqueado pelo cliente (segunda 20/04)

### Campanha Dormant — 3 links de oferta
**Quem:** Bruno · **Quando:** segunda 20/04
**O que falta:**
- [ ] Criar páginas de checkout pras 3 ofertas:
  - Plano Experiência: 2 potes + 1 grátis
  - Plano Completo (⭐ MAIS POPULAR): 3 potes + 2 grátis
  - Melhor Custo (🔥): 5 potes + 4 grátis
- [ ] Gerar links definitivos (sugestão de URL: `/oferta-retorno/2-potes`, `/oferta-retorno/3-potes`, `/oferta-retorno/5-potes`)

**Quando os links chegarem, fazer:**
1. `UPDATE campaigns SET email_body = REPLACE(REPLACE(REPLACE(email_body, '{LINK_2POTES}', '...'), '{LINK_3POTES}', '...'), '{LINK_5POTES}', '...') WHERE id='5f9760b8-643b-4ea7-b1c5-94d6e9022335'`
2. Disparar preview pra `agenciaveddu@gmail.com` via `/api/campaigns/send-test/`
3. Bruno valida → iniciar aquecimento gradual:
   - **Dia 1:** 50 emails (2.5%)
   - **Dia 2:** 200 emails (10%)
   - **Dia 3:** 500 emails (25%)
   - **Dia 4:** 1000 emails (50%)
   - **Dia 5:** restante ~270 (13%)

---

## 🟡 Próximas etapas (em paralelo)

### Antes do disparo dos 2002 (importante)
- [ ] **SNS webhooks SES** — capturar bounces e complaints automaticamente (proteger reputação)
- [ ] **Tracking de abertura** — pixel transparente
- [ ] **Tracking de cliques** — link redirect com analytics

### Pode esperar
- [ ] Importar 9k leads restantes do Braip (Bruno baixa CSV → eu importo)
- [ ] Sequência de follow-up (email 2 em 3 dias, email 3 em 7 dias)
- [ ] Dashboard de métricas das campanhas
- [ ] Integração WhatsApp (tabelas conversations/messages do CRM)
- [ ] Agente AI (agent_config já tem persona)
- [ ] Automação de redes sociais (Instagram Graph API)

---

## ✅ Concluído (sessões anteriores)

- ✅ Quizzes (3) integrados ao Supabase via `/blog/api/quiz-lead/`
- ✅ Sequências de boas-vindas (sono, dopamina, ansiedade) — disparo automático
- ✅ Sistema de campanhas via CRM (`campaigns` + `campaign_contacts`)
- ✅ Cron de envio (a cada 10min)
- ✅ Compliance LGPD: unsubscribe HMAC + landing `/blog/descadastrar/` + List-Unsubscribe RFC 8058
- ✅ Service role key Supabase (bypass RLS)
- ✅ Endpoint `/api/campaigns/send-test/` para previews em `agenciaveddu@gmail.com`
- ✅ Campanha VIP enviada (6 clientes recent — sent_count=6, completed)
- ✅ Email de teste padrão: agenciaveddu@gmail.com (Bruno Teste)
