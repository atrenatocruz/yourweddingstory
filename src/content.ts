export interface Cta {
  label: string
  href: string
  external?: boolean
}

export interface SiteContent {
  eyebrow: string
  headline: string
  body: string
  heroImageUrl: string
  heroImageAlt: string
  ctas: Cta[]
  social: {
    emailHref: string
    instagramHref: string
  }
}

export const content: SiteContent = {
  eyebrow: 'Your Wedding Story',
  headline: 'Wedding Content Creation & Storymaking',
  body: 'Keep the memories of your big day alive through authentic content that captures every meaningful moment, allowing you to relive your wedding story from a whole new perspective.',
  heroImageUrl: 'https://images.msha.ke/aba09fb5-788d-4cdd-997a-e5a8ab992a13',
  heroImageAlt: 'Bridal bouquet resting on a veil',
  ctas: [
    {
      label: 'Enquire About Your Wedding Day',
      href: 'https://app.studioninja.co/contactform/hosted/0a800fc8-9f7f-1f92-819f-843e8ea7489c/0a800fc8-9f7f-1f92-819f-843e8ebb489e',
      external: true,
    },
    {
      label: 'Send Me An Email',
      href: 'mailto:geral@melaniefernandes.com',
    },
  ],
  social: {
    emailHref: 'mailto:geral@melaniefernandes.com',
    instagramHref: 'https://www.instagram.com/yourweddingstory_/',
  },
}
