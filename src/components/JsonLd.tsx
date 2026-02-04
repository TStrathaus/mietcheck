// src/components/JsonLd.tsx
// Schema.org structured data for SEO

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MietCheck.ch',
    url: 'https://mietcheck-nine.vercel.app',
    logo: 'https://mietcheck-nine.vercel.app/logo.png',
    description: 'Automatischer Mietminderungs-Service für die Schweiz',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CH',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Switzerland',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebApplicationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MietCheck.ch',
    url: 'https://mietcheck-nine.vercel.app',
    description: 'Prüfen Sie Ihren Mietvertrag auf Sparpotential und senken Sie Ihre Miete legal um CHF 300-700 pro Jahr.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '29.00',
      priceCurrency: 'CHF',
      description: 'Mietvertrag-Analyse und Mietsenkungsbrief',
    },
    featureList: [
      'Automatische Mietvertrag-Analyse',
      'Berechnung der möglichen Mietsenkung',
      'Generierung eines rechtsgültigen Mietsenkungsbriefs',
      'Basierend auf aktuellem Referenzzins',
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Mieter in der Schweiz',
      geographicArea: {
        '@type': 'Country',
        name: 'Switzerland',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Was ist der Referenzzins?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Der hypothekarische Referenzzins ist ein vom Bundesamt für Wohnungswesen (BWO) vierteljährlich publizierter Zinssatz, der als Basis für Mietzinsanpassungen in der Schweiz dient. Sinkt der Referenzzins, haben Mieter grundsätzlich Anspruch auf eine Mietzinsreduktion.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wie viel kann ich bei meiner Miete sparen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Die mögliche Ersparnis hängt vom aktuellen Referenzzins und dem Zinssatz ab, der bei Ihrer letzten Mietzinsanpassung galt. Typischerweise können Mieter CHF 300-700 pro Jahr sparen, in manchen Fällen sogar mehr.',
        },
      },
      {
        '@type': 'Question',
        name: 'Ist eine Mietsenkung rechtlich zulässig?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, gemäss OR 269d und VMWG Art. 13 haben Mieter in der Schweiz das Recht, bei gesunkenem Referenzzins eine Mietzinsreduktion zu verlangen. Der Vermieter muss darauf reagieren.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wie funktioniert MietCheck.ch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Laden Sie einfach Ihren Mietvertrag hoch. Unsere KI analysiert die relevanten Daten und berechnet, ob Sie Anspruch auf eine Mietsenkung haben. Bei positivem Ergebnis generieren wir einen rechtsgültigen Brief, den Sie nur noch unterschreiben und an Ihren Vermieter senden müssen.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
