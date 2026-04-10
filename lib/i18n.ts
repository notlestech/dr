export type Locale = 'en' | 'pt'

export const translations = {
  en: {
    nav: {
      howItWorks: 'How it works',
      features: 'Features',
      pricing: 'Pricing',
      signIn: 'Sign in',
      getStarted: 'Get started',
    },
    hero: {
      badge: 'Live draws for streamers & companies',
      line1: 'Run giveaways your',
      line2: 'audience will love',
      subtitle:
        'Create beautiful entry forms, collect entries in real-time, and draw winners live with a dramatic slot machine animation.',
      cta: 'Start for free',
      ctaSecondary: 'Sign in',
      tagline: 'No credit card required · Free forever plan',
    },
    stats: {
      creators: 'Creators',
      entries: 'Entries drawn',
      forms: 'Forms created',
    },
    howItWorks: {
      eyebrow: 'How it works',
      heading1: 'Up and running in',
      heading2: 'minutes',
      steps: [
        {
          title: 'Create your form',
          desc: 'Pick from 10 beautiful templates, set your prizes and entry rules — ready in under 2 minutes.',
        },
        {
          title: 'Share your link',
          desc: 'Every form gets its own subdomain. Drop it in chat, tweet it, or embed it on your site.',
        },
        {
          title: 'Draw a winner live',
          desc: 'Launch the slot machine with one click. Fullscreen mode is built for OBS capture on stream.',
        },
      ],
    },
    features: {
      eyebrow: 'Features',
      heading1: 'Everything to run',
      heading2: 'great giveaways',
      subtitle: 'Built for streamers who want drama, and companies who want reliability.',
      items: [
        { title: '10 Form Templates',      desc: 'From minimal clean cards to neon gaming overlays — pick a design that fits your brand.' },
        { title: 'Live Slot Machine Draw',  desc: 'Dramatic animated draw with Fisher-Yates shuffle. Fullscreen mode built for OBS capture.' },
        { title: 'Real-time Entry Count',  desc: 'Entries update live on the public form and your OBS overlay — no refresh needed.' },
        { title: 'Custom Subdomain',       desc: 'Every form gets a unique link at yourname.drawvault.site — shareable in seconds.' },
        { title: 'Bot Protection',         desc: 'Cloudflare Turnstile + IP deduplication blocks spam entries before they happen.' },
        { title: 'Analytics & Export',     desc: 'See entries per day, source breakdown, and export to CSV with one click.' },
      ],
    },
    testimonials: {
      eyebrow: 'Testimonials',
      heading1: 'Loved by',
      heading2: 'creators',
    },
    pricing: {
      eyebrow: 'Pricing',
      heading1: 'Simple,',
      heading2: 'transparent',
      subtitle: 'Start free. Upgrade when you need more.',
      guarantee: 'All plans include 14-day money-back guarantee · Cancel anytime',
      plans: [
        { name: 'Free',     description: 'Perfect to get started',        cta: 'Start free' },
        { name: 'Pro',      description: 'For creators & streamers',       cta: 'Get Pro' },
        { name: 'Business', description: 'For agencies & companies',       cta: 'Get Business' },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      heading1: 'Common',
      heading2: 'questions',
      items: [
        { q: 'Is DrawVault free to use?',                           a: 'Yes — the Free plan gives you 3 forms, 500 entries each, and 1 draw per form. No credit card required.' },
        { q: 'How does the live draw work?',                        a: 'Entries are shuffled with a Fisher-Yates algorithm for a fair, verifiable draw. The slot machine animation runs fullscreen with OBS capture support built in.' },
        { q: 'How do you prevent duplicate entries?',               a: 'IP deduplication is on by default. Pro and Business plans layer in Cloudflare Turnstile bot protection on top.' },
        { q: 'Can I use DrawVault for Twitch or YouTube giveaways?', a: 'Absolutely. Share the public form link in chat, run the fullscreen draw live on stream, and capture it directly with OBS.' },
        { q: 'Can I export my entry list?',                         a: 'Yes — Pro and Business plans include one-click CSV export from the analytics dashboard.' },
        { q: "What happens when a form hits its entry limit?",      a: 'New entries are blocked and visitors see a "form closed" message. You can upgrade your plan or archive old forms to free up capacity at any time.' },
      ],
    },
    cta: {
      title: 'Ready to run your first draw?',
      subtitle: 'Create your form, share the link, and draw a winner live — all in under 5 minutes.',
      button: 'Start for free',
    },
    footer: {
      howItWorks: 'How it works',
      features: 'Features',
      pricing: 'Pricing',
      signIn: 'Sign in',
      rights: 'All rights reserved.',
    },
  },

  pt: {
    nav: {
      howItWorks: 'Como funciona',
      features: 'Recursos',
      pricing: 'Preços',
      signIn: 'Entrar',
      getStarted: 'Começar',
    },
    hero: {
      badge: 'Sorteios ao vivo para streamers e empresas',
      line1: 'Faça sorteios que seu',
      line2: 'público vai adorar',
      subtitle:
        'Crie formulários bonitos, colete inscrições em tempo real e sorteie ganhadores ao vivo com uma incrível animação de slot machine.',
      cta: 'Começar grátis',
      ctaSecondary: 'Entrar',
      tagline: 'Sem cartão de crédito · Plano gratuito para sempre',
    },
    stats: {
      creators: 'Criadores',
      entries: 'Sorteios realizados',
      forms: 'Formulários criados',
    },
    howItWorks: {
      eyebrow: 'Como funciona',
      heading1: 'Pronto em',
      heading2: 'minutos',
      steps: [
        {
          title: 'Crie seu formulário',
          desc: 'Escolha entre 10 templates, defina seus prêmios e regras — pronto em menos de 2 minutos.',
        },
        {
          title: 'Compartilhe o link',
          desc: 'Cada formulário tem seu próprio subdomínio. Cole no chat, tweet ou incorpore no seu site.',
        },
        {
          title: 'Sorteie ao vivo',
          desc: 'Lance a slot machine com um clique. Modo tela cheia feito para captura no OBS.',
        },
      ],
    },
    features: {
      eyebrow: 'Recursos',
      heading1: 'Tudo para fazer',
      heading2: 'ótimos sorteios',
      subtitle: 'Feito para streamers que querem drama e empresas que precisam de confiabilidade.',
      items: [
        { title: '10 Templates de Formulário',  desc: 'De cards minimalistas a overlays neon — escolha o design que combina com sua marca.' },
        { title: 'Sorteio com Slot Machine',     desc: 'Animação dramática com embaralhamento Fisher-Yates. Modo tela cheia feito para OBS.' },
        { title: 'Contagem em Tempo Real',       desc: 'Inscrições atualizam ao vivo no formulário público e no overlay do OBS.' },
        { title: 'Subdomínio Personalizado',     desc: 'Cada formulário tem um link em seuname.drawvault.site — compartilhável em segundos.' },
        { title: 'Proteção contra Bots',         desc: 'Cloudflare Turnstile + deduplicação de IP bloqueia inscrições spam antes que aconteçam.' },
        { title: 'Analytics e Export',           desc: 'Veja inscrições por dia, origem do tráfego e exporte para CSV com um clique.' },
      ],
    },
    testimonials: {
      eyebrow: 'Depoimentos',
      heading1: 'Amado pelos',
      heading2: 'criadores',
    },
    pricing: {
      eyebrow: 'Preços',
      heading1: 'Simples e',
      heading2: 'transparente',
      subtitle: 'Comece grátis. Faça upgrade quando precisar de mais.',
      guarantee: 'Todos os planos incluem garantia de 14 dias · Cancele quando quiser',
      plans: [
        { name: 'Grátis',   description: 'Perfeito para começar',           cta: 'Começar grátis' },
        { name: 'Pro',      description: 'Para criadores e streamers',       cta: 'Obter Pro' },
        { name: 'Business', description: 'Para agências e empresas',         cta: 'Obter Business' },
      ],
    },
    faq: {
      eyebrow: 'Dúvidas',
      heading1: 'Perguntas',
      heading2: 'frequentes',
      items: [
        { q: 'O DrawVault é gratuito?',                                   a: 'Sim — o plano Grátis oferece 3 formulários, 500 inscrições cada e 1 sorteio por formulário. Sem cartão de crédito.' },
        { q: 'Como funciona o sorteio ao vivo?',                          a: 'As inscrições são embaralhadas com o algoritmo Fisher-Yates para um sorteio justo. A animação roda em tela cheia com suporte ao OBS.' },
        { q: 'Como evitar inscrições duplicadas?',                        a: 'Deduplicação por IP está ativa por padrão. Planos Pro e Business adicionam proteção Cloudflare Turnstile.' },
        { q: 'Posso usar para sorteios na Twitch ou YouTube?',            a: 'Claro. Compartilhe o link no chat, rode o sorteio ao vivo na stream e capture com OBS.' },
        { q: 'Posso exportar a lista de inscrições?',                     a: 'Sim — planos Pro e Business incluem exportação CSV com um clique no painel de analytics.' },
        { q: 'O que acontece quando o formulário atinge o limite?',       a: 'Novas inscrições são bloqueadas. Você pode fazer upgrade ou arquivar formulários antigos a qualquer momento.' },
      ],
    },
    cta: {
      title: 'Pronto para o seu primeiro sorteio?',
      subtitle: 'Crie seu formulário, compartilhe o link e sorteie um ganhador ao vivo — tudo em menos de 5 minutos.',
      button: 'Começar grátis',
    },
    footer: {
      howItWorks: 'Como funciona',
      features: 'Recursos',
      pricing: 'Preços',
      signIn: 'Entrar',
      rights: 'Todos os direitos reservados.',
    },
  },
} satisfies Record<Locale, unknown>

export type Translations = (typeof translations)['en']
