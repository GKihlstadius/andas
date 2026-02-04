// ============================================
// ANDAS - SWEDISH TRANSLATIONS (DEFAULT)
// ============================================

export const sv = {
  // Common
  common: {
    continue: 'Fortsätt',
    skip: 'Hoppa över',
    cancel: 'Avbryt',
    done: 'Klar',
    back: 'Tillbaka',
    settings: 'Inställningar',
    save: 'Spara',
    reset: 'Återställ',
    loading: 'Laddar...',
    error: 'Något gick fel',
    retry: 'Försök igen',
  },

  // Navigation
  nav: {
    home: 'Hem',
    history: 'Historik',
    progress: 'Framsteg',
    settings: 'Inställningar',
  },

  // Home Screen
  home: {
    greeting: {
      night: 'God natt',
      morning: 'God morgon',
      afternoon: 'God eftermiddag',
      evening: 'God kväll',
    },
    title: 'Ta ett andetag',
    recommended: 'Rekommenderad',
    baseline: {
      calm: 'Lugn',
      neutral: 'Neutral',
      stressed: 'Stressad',
      overstimulated: 'Överstimulerad',
    },
    sensitivity: {
      low: 'Låg',
      medium: 'Medium',
      high: 'Hög',
    },
    baselineLabel: '{{state}} baseline',
    sensitivityLabel: '{{level}} känslighet',
    avoidHolds: 'Undviker anhåll',
    avoidFast: 'Undviker snabb andning',
    debugReset: 'Återställ (debug)',
  },

  // Categories
  categories: {
    lugn: 'Lugn',
    fokus: 'Fokus',
    energi: 'Energi',
  },

  // Exercises
  exercises: {
    'physiological-sigh': {
      name: 'Fysiologisk suck',
      shortDescription: 'Snabb nedreglering',
      description: 'Dubbel inandning följd av lång utandning. Kroppens naturliga lugn-knapp.',
      guidance: {
        start: 'Andas in genom näsan, kort paus, andas in lite till.',
        end: 'Låt andningen återgå.',
      },
    },
    coherent: {
      name: 'Koherent andning',
      shortDescription: 'Hjärt-hjärna synk',
      description: 'Jämn rytm som synkroniserar hjärta och andning.',
      guidance: {
        start: 'Hitta en bekväm rytm.',
        mid: 'Låt kroppen göra jobbet.',
        end: 'Stanna kvar en stund.',
      },
    },
    'extended-exhale': {
      name: 'Förlängd utandning',
      shortDescription: '4-6 andning',
      description: 'Längre utandning aktiverar parasympatiska systemet.',
      guidance: {
        start: 'Utandningen får vara mjuk.',
        end: 'Känn hur kroppen landar.',
      },
    },
    '478': {
      name: '4-7-8 andning',
      shortDescription: 'Sömn och vila',
      description: 'Aktiverar djup avslappning. Innehåller anhåll.',
      guidance: {
        start: 'Låt det ta tid.',
        end: 'Vila i stillheten.',
      },
    },
    'trauma-safe': {
      name: 'Trygg andning',
      shortDescription: 'Extra skonsam',
      description: 'Mjuk rytm utan anhåll. Trygg för alla.',
      guidance: {
        start: 'Det här är mjukt.',
        end: 'Du tog hand om dig.',
      },
    },
    box: {
      name: 'Box breathing',
      shortDescription: 'Fyrkant för stabilitet',
      description: 'Fyra lika faser bygger en känsla av stadga. Ingen brådska.',
      guidance: {
        start: 'Föreställ dig att du ritar en fyrkant med andningen.',
        mid: 'Ingen fas är viktigare än någon annan.',
        end: 'Känn stabiliteten du har skapat.',
      },
    },
    'soft-focus': {
      name: 'Mjuk fokus',
      shortDescription: 'Närvaro utan ansträngning',
      description: 'En enkel rytm som stödjer närvaro utan att prestera.',
      guidance: {
        start: 'Låt andningen hitta sin egen rytm.',
        mid: 'Du behöver inte göra något rätt.',
        end: 'Bär denna närvaron med dig.',
      },
    },
    'grounding-breath': {
      name: 'Jordande andning',
      shortDescription: 'Förankring i nuet',
      description: 'Längre utandning för att landa i kroppen och nuet.',
      guidance: {
        start: 'Andas in genom näsan, ut genom munnen.',
        mid: 'Känn kontakten med underlaget.',
        end: 'Du är här. Just nu.',
      },
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Välkommen till ANDAS',
      subtitle: 'Trygg breathwork för riktiga liv',
      description: 'Vi börjar med några frågor för att anpassa din upplevelse.',
    },
    questions: {
      baseline: {
        question: 'Hur brukar du känna dig i vardagen?',
        subtext: 'Tänk på de senaste veckorna.',
        options: {
          calm: 'Oftast lugn',
          neutral: 'Varierar',
          stressed: 'Ofta stressad',
          overwhelmed: 'Ofta överväldigad',
        },
      },
      experience: {
        question: 'Har du provat andningsövningar förut?',
        subtext: 'Det finns inget rätt svar.',
        options: {
          none: 'Aldrig',
          some: 'Lite grann',
          regular: 'Regelbundet',
        },
      },
      contraindications: {
        question: 'Finns något av detta?',
        subtext: 'Vi anpassar övningarna. Ingen blir utesluten.',
        options: {
          none: 'Inget av detta',
          anxiety: 'Ångest eller panik',
          heart: 'Hjärtproblem',
          pregnancy: 'Gravid',
        },
      },
    },
    safetyNote: 'ANDAS anpassar övningarna efter ditt nervsystem. Ibland säger appen nej – det är för din säkerhet.',
  },

  // Preparation Screen
  preparation: {
    duration: 'Längd',
    minutes: '{{count}} min',
    rounds: '{{count}} cykler',
    start: 'Börja',
    safetyAdapted: 'Anpassad för dig',
    alternative: 'Vi rekommenderar {{name}} istället',
  },

  // Session Screen
  session: {
    phases: {
      ready: 'Gör dig redo',
      countdown: 'Börjar snart',
      inhale: 'Andas in',
      holdIn: 'Håll',
      exhale: 'Andas ut',
      holdOut: 'Håll',
      complete: 'Klar',
    },
    cycle: 'Cykel {{current}} av {{total}}',
    cycleInfinite: 'Cykel {{current}}',
    exit: 'Avsluta',
    exitConfirm: {
      title: 'Avsluta sessionen?',
      message: 'Du kan alltid komma tillbaka.',
      stay: 'Stanna',
      exit: 'Avsluta',
    },
  },

  // Integration Screen
  integration: {
    title: 'Integration',
    texts: [
      'Ligg kvar. Känn kroppen.',
      'Inget att göra. Bara vara.',
      'Låt andningen vara naturlig.',
      'Känn fötterna mot golvet.',
      'Du är här. Just nu.',
    ],
    microAction: {
      title: 'Ett litet steg',
      water: 'Drick ett glas vatten',
      walk: 'Gå en kort promenad',
      journal: 'Skriv en mening om hur du mår',
      sleep: 'Förbered för sömn',
      stretch: 'Sträck på dig',
    },
  },

  // Feedback Screen
  feedback: {
    title: 'Hur känns kroppen nu?',
    cycles: '{{count}} cykler',
    options: {
      calmer: 'Lugnare',
      same: 'Samma',
      moreActivated: 'Mer aktiverad',
    },
    skip: 'Hoppa över',
    thankYou: 'Tack för din feedback',
  },

  // History Screen
  history: {
    title: 'Historik',
    empty: 'Inga sessioner än',
    emptySubtext: 'Dina sessioner kommer att visas här.',
    today: 'Idag',
    yesterday: 'Igår',
    thisWeek: 'Denna vecka',
    earlier: 'Tidigare',
    session: {
      duration: '{{minutes}} min',
      cycles: '{{count}} cykler',
      feedback: {
        calmer: 'Kände sig lugnare',
        same: 'Ingen förändring',
        moreActivated: 'Kände sig mer aktiverad',
      },
      earlyExit: 'Avslutades tidigt',
    },
  },

  // Progress Screen (Weekly Summary)
  progress: {
    title: 'Din vecka',
    thisWeek: 'Denna vecka',
    totalSessions: 'Totalt sessioner',
    totalMinutes: 'Totalt minuter',
    averageDuration: 'Snittlängd',
    mostUsed: 'Mest använda',
    streak: {
      current: '{{count}} dagar i rad',
      best: 'Bästa: {{count}} dagar',
    },
    insights: {
      title: 'Insikter',
      improving: 'Du har blivit mer bekväm med {{exercise}}',
      consistent: 'Bra jobbat med regelbundenheten!',
      tryNew: 'Har du provat {{exercise}}?',
      moreTime: 'Prova lite längre sessioner för djupare effekt',
    },
    chart: {
      sessions: 'Sessioner',
      minutes: 'Minuter',
      mon: 'Mån',
      tue: 'Tis',
      wed: 'Ons',
      thu: 'Tor',
      fri: 'Fre',
      sat: 'Lör',
      sun: 'Sön',
    },
    noData: 'Ingen data att visa ännu',
    noDataSubtext: 'Börja med en session för att se dina framsteg.',
  },

  // Settings Screen
  settings: {
    title: 'Inställningar',
    sections: {
      preferences: 'Preferenser',
      audio: 'Ljud',
      data: 'Data',
      about: 'Om',
    },
    language: {
      title: 'Språk',
      sv: 'Svenska',
      en: 'English',
    },
    audio: {
      enabled: 'Ljudguidning',
      enabledDescription: 'Spela ljudtoner under sessionen',
      volume: 'Volym',
      haptics: 'Haptisk feedback',
      hapticsDescription: 'Vibration vid fasövergångar',
      backgroundSounds: 'Bakgrundsljud',
      backgroundSoundsDescription: 'Avslappnande ljud under sessionen',
      backgroundType: {
        none: 'Inget',
        rain: 'Regn',
        ocean: 'Hav',
        forest: 'Skog',
        white: 'Vitt brus',
      },
    },
    notifications: {
      title: 'Påminnelser',
      enabled: 'Dagliga påminnelser',
      time: 'Tid',
    },
    hrv: {
      title: 'HRV-integration',
      enabled: 'Apple Health',
      enabledDescription: 'Synka HRV-data för personligare upplevelse',
      status: {
        connected: 'Ansluten',
        disconnected: 'Ej ansluten',
        syncing: 'Synkar...',
      },
    },
    therapist: {
      title: 'Terapeutdelning',
      enabled: 'Dela med terapeut',
      enabledDescription: 'Skapa en rapport att dela',
      generateReport: 'Skapa rapport',
      reportGenerated: 'Rapport skapad',
    },
    data: {
      export: 'Exportera data',
      exportDescription: 'Ladda ner all din data',
      reset: 'Återställ allt',
      resetDescription: 'Radera all data och börja om',
      resetConfirm: {
        title: 'Återställ allt?',
        message: 'Detta kan inte ångras.',
        cancel: 'Avbryt',
        confirm: 'Återställ',
      },
    },
    about: {
      version: 'Version',
      privacy: 'Integritetspolicy',
      terms: 'Användarvillkor',
      contact: 'Kontakta oss',
    },
  },

  // Safety Messages
  safety: {
    adapted: 'Anpassad',
    blocked: 'Inte tillgänglig just nu',
    alternative: 'Prova {{name}} istället',
    reason: {
      breathHolds: 'Undviker anhåll för din säkerhet',
      fastBreathing: 'Undviker snabb andning för din säkerhet',
      highIntensity: 'Sänkt intensitet för din trygghet',
      lowCapacity: 'Bygg upp gradvis för bästa resultat',
    },
  },

  // Errors
  errors: {
    generic: 'Något gick fel',
    network: 'Kontrollera din internetanslutning',
    storage: 'Kunde inte spara dina data',
    audio: 'Kunde inte spela upp ljud',
  },
};
