// ============================================
// ANDAS - ENGLISH TRANSLATIONS
// ============================================

export const en = {
  // Common
  common: {
    continue: 'Continue',
    skip: 'Skip',
    cancel: 'Cancel',
    done: 'Done',
    back: 'Back',
    settings: 'Settings',
    save: 'Save',
    reset: 'Reset',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
  },

  // Navigation
  nav: {
    home: 'Home',
    history: 'History',
    progress: 'Progress',
    settings: 'Settings',
  },

  // Home Screen
  home: {
    greeting: {
      night: 'Good night',
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    title: 'Take a breath',
    recommended: 'Recommended',
    baseline: {
      calm: 'Calm',
      neutral: 'Neutral',
      stressed: 'Stressed',
      overstimulated: 'Overstimulated',
    },
    sensitivity: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    baselineLabel: '{{state}} baseline',
    sensitivityLabel: '{{level}} sensitivity',
    avoidHolds: 'Avoiding breath holds',
    avoidFast: 'Avoiding fast breathing',
    debugReset: 'Reset (debug)',
  },

  // Categories
  categories: {
    lugn: 'Calm',
    fokus: 'Focus',
    energi: 'Energy',
  },

  // Exercises
  exercises: {
    'physiological-sigh': {
      name: 'Physiological sigh',
      shortDescription: 'Quick down-regulation',
      description: 'Double inhale followed by long exhale. The body\'s natural calm button.',
      guidance: {
        start: 'Breathe in through your nose, short pause, breathe in a little more.',
        end: 'Let your breathing return to normal.',
      },
    },
    coherent: {
      name: 'Coherent breathing',
      shortDescription: 'Heart-brain sync',
      description: 'Even rhythm that synchronizes heart and breath.',
      guidance: {
        start: 'Find a comfortable rhythm.',
        mid: 'Let your body do the work.',
        end: 'Stay here for a moment.',
      },
    },
    'extended-exhale': {
      name: 'Extended exhale',
      shortDescription: '4-6 breathing',
      description: 'Longer exhale activates the parasympathetic system.',
      guidance: {
        start: 'The exhale can be soft.',
        end: 'Feel how your body settles.',
      },
    },
    '478': {
      name: '4-7-8 breathing',
      shortDescription: 'Sleep and rest',
      description: 'Activates deep relaxation. Contains breath holds.',
      guidance: {
        start: 'Take your time.',
        end: 'Rest in the stillness.',
      },
    },
    'trauma-safe': {
      name: 'Safe breathing',
      shortDescription: 'Extra gentle',
      description: 'Soft rhythm without breath holds. Safe for everyone.',
      guidance: {
        start: 'This is gentle.',
        end: 'You took care of yourself.',
      },
    },
    box: {
      name: 'Box breathing',
      shortDescription: 'Square for stability',
      description: 'Four equal phases build a sense of steadiness. No rush.',
      guidance: {
        start: 'Imagine drawing a square with your breath.',
        mid: 'No phase is more important than another.',
        end: 'Feel the stability you have created.',
      },
    },
    'soft-focus': {
      name: 'Soft focus',
      shortDescription: 'Presence without effort',
      description: 'A simple rhythm that supports presence without performing.',
      guidance: {
        start: 'Let your breath find its own rhythm.',
        mid: 'You don\'t need to do anything right.',
        end: 'Carry this presence with you.',
      },
    },
    'grounding-breath': {
      name: 'Grounding breath',
      shortDescription: 'Anchoring in the present',
      description: 'Longer exhale to land in your body and the present.',
      guidance: {
        start: 'Breathe in through your nose, out through your mouth.',
        mid: 'Feel the contact with the surface beneath you.',
        end: 'You are here. Right now.',
      },
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome to ANDAS',
      subtitle: 'Safe breathwork for real life',
      description: 'We\'ll start with a few questions to personalize your experience.',
    },
    questions: {
      baseline: {
        question: 'How do you usually feel in everyday life?',
        subtext: 'Think about the last few weeks.',
        options: {
          calm: 'Usually calm',
          neutral: 'Varies',
          stressed: 'Often stressed',
          overwhelmed: 'Often overwhelmed',
        },
      },
      experience: {
        question: 'Have you tried breathing exercises before?',
        subtext: 'There\'s no right answer.',
        options: {
          none: 'Never',
          some: 'A little',
          regular: 'Regularly',
        },
      },
      contraindications: {
        question: 'Does any of this apply to you?',
        subtext: 'We adapt the exercises. No one is excluded.',
        options: {
          none: 'None of these',
          anxiety: 'Anxiety or panic',
          heart: 'Heart problems',
          pregnancy: 'Pregnant',
        },
      },
    },
    safetyNote: 'ANDAS adapts exercises to your nervous system. Sometimes the app says no – that\'s for your safety.',
  },

  // Preparation Screen
  preparation: {
    duration: 'Duration',
    minutes: '{{count}} min',
    rounds: '{{count}} cycles',
    start: 'Start',
    safetyAdapted: 'Adapted for you',
    alternative: 'We recommend {{name}} instead',
  },

  // Session Screen
  session: {
    phases: {
      ready: 'Get ready',
      countdown: 'Starting soon',
      inhale: 'Breathe in',
      holdIn: 'Hold',
      exhale: 'Breathe out',
      holdOut: 'Hold',
      complete: 'Complete',
    },
    cycle: 'Cycle {{current}} of {{total}}',
    cycleInfinite: 'Cycle {{current}}',
    exit: 'Exit',
    exitConfirm: {
      title: 'Exit session?',
      message: 'You can always come back.',
      stay: 'Stay',
      exit: 'Exit',
    },
  },

  // Integration Screen
  integration: {
    title: 'Integration',
    texts: [
      'Stay still. Feel your body.',
      'Nothing to do. Just be.',
      'Let your breathing be natural.',
      'Feel your feet on the ground.',
      'You are here. Right now.',
    ],
    microAction: {
      title: 'A small step',
      water: 'Drink a glass of water',
      walk: 'Take a short walk',
      journal: 'Write a sentence about how you feel',
      sleep: 'Prepare for sleep',
      stretch: 'Stretch',
    },
  },

  // Feedback Screen
  feedback: {
    title: 'How does your body feel now?',
    cycles: '{{count}} cycles',
    options: {
      calmer: 'Calmer',
      same: 'The same',
      moreActivated: 'More activated',
    },
    skip: 'Skip',
    thankYou: 'Thank you for your feedback',
  },

  // History Screen
  history: {
    title: 'History',
    empty: 'No sessions yet',
    emptySubtext: 'Your sessions will appear here.',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    earlier: 'Earlier',
    session: {
      duration: '{{minutes}} min',
      cycles: '{{count}} cycles',
      feedback: {
        calmer: 'Felt calmer',
        same: 'No change',
        moreActivated: 'Felt more activated',
      },
      earlyExit: 'Ended early',
    },
  },

  // Progress Screen (Weekly Summary)
  progress: {
    title: 'Your week',
    thisWeek: 'This week',
    totalSessions: 'Total sessions',
    totalMinutes: 'Total minutes',
    averageDuration: 'Average duration',
    mostUsed: 'Most used',
    streak: {
      current: '{{count}} days in a row',
      best: 'Best: {{count}} days',
    },
    insights: {
      title: 'Insights',
      improving: 'You\'ve become more comfortable with {{exercise}}',
      consistent: 'Great job with consistency!',
      tryNew: 'Have you tried {{exercise}}?',
      moreTime: 'Try longer sessions for deeper effect',
    },
    chart: {
      sessions: 'Sessions',
      minutes: 'Minutes',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    },
    noData: 'No data to show yet',
    noDataSubtext: 'Start with a session to see your progress.',
  },

  // Settings Screen
  settings: {
    title: 'Settings',
    sections: {
      preferences: 'Preferences',
      audio: 'Audio',
      data: 'Data',
      about: 'About',
    },
    language: {
      title: 'Language',
      sv: 'Svenska',
      en: 'English',
    },
    audio: {
      enabled: 'Audio guidance',
      enabledDescription: 'Play audio tones during session',
      volume: 'Volume',
      haptics: 'Haptic feedback',
      hapticsDescription: 'Vibration at phase transitions',
      backgroundSounds: 'Background sounds',
      backgroundSoundsDescription: 'Relaxing sounds during session',
      backgroundType: {
        none: 'None',
        rain: 'Rain',
        ocean: 'Ocean',
        forest: 'Forest',
        white: 'White noise',
      },
    },
    notifications: {
      title: 'Reminders',
      enabled: 'Daily reminders',
      time: 'Time',
    },
    hrv: {
      title: 'HRV Integration',
      enabled: 'Apple Health',
      enabledDescription: 'Sync HRV data for personalized experience',
      status: {
        connected: 'Connected',
        disconnected: 'Not connected',
        syncing: 'Syncing...',
      },
    },
    therapist: {
      title: 'Therapist Sharing',
      enabled: 'Share with therapist',
      enabledDescription: 'Create a report to share',
      generateReport: 'Generate report',
      reportGenerated: 'Report generated',
    },
    data: {
      export: 'Export data',
      exportDescription: 'Download all your data',
      reset: 'Reset everything',
      resetDescription: 'Delete all data and start over',
      resetConfirm: {
        title: 'Reset everything?',
        message: 'This cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Reset',
      },
    },
    about: {
      version: 'Version',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us',
    },
  },

  // Safety Messages
  safety: {
    adapted: 'Adapted',
    blocked: 'Not available right now',
    alternative: 'Try {{name}} instead',
    reason: {
      breathHolds: 'Avoiding breath holds for your safety',
      fastBreathing: 'Avoiding fast breathing for your safety',
      highIntensity: 'Reduced intensity for your comfort',
      lowCapacity: 'Build up gradually for best results',
    },
  },

  // Errors
  errors: {
    generic: 'Something went wrong',
    network: 'Check your internet connection',
    storage: 'Could not save your data',
    audio: 'Could not play audio',
  },
};
