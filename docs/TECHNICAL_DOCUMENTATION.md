# ANDAS - Teknisk Dokumentation

## Översikt

ANDAS är en React Native-baserad breathwork-app med fokus på nervsystemssäkerhet. Arkitekturen är designad för att separera affärslogik från UI, möjliggöra progressiv förbättring, och stödja framtida utbyggnad.

---

## Arkitekturöversikt

```
andas/
├── src/
│   ├── breathing/          # Andningsmotor (pure logic)
│   ├── components/         # Återanvändbara UI-komponenter
│   ├── data/              # Typer, konstanter, övningsdata
│   ├── navigation/        # Navigationskonfiguration
│   ├── safety/            # Säkerhetsmotor (core business logic)
│   ├── screens/           # Skärmkomponenter
│   ├── state/             # Global state management
│   └── hooks/             # Custom React hooks
```

---

## Kärnkomponenter

### 1. Safety Engine (`src/safety/`)

**Filosofi**: Alla övningar måste passera säkerhetskontrollen innan de visas för användaren.

**Huvudfunktioner**:
- `checkExerciseSafety()` - Grundläggande säkerhetskontroll
- `checkExerciseSafetyV2()` - Utökad kontroll med kontext
- `getRecommendedExercise()` - Personlig rekommendation
- `getSafeExercisesForCategory()` - Filtrerad övningslista
- `getRecommendedDuration()` - Anpassad sessionslängd
- `getIntegrationConfig()` - Efter-session konfiguration

**Säkerhetsnivåer**:
1. **Hard blocks** - Kontraindikationer (kan ej överridas)
2. **Adaptive blocks** - Lärda preferenser från feedback
3. **Adaptations** - Mönsteranpassningar (kortare håll, etc.)
4. **Allow** - Övningen är säker som den är

**Exempel på användning**:
```typescript
import { checkExerciseSafetyV2, getSessionContext } from '../safety';

const decision = checkExerciseSafetyV2(exercise, userState, context);

switch (decision.type) {
  case 'allow':
    // Visa övning normalt
    break;
  case 'adapt':
    // Visa med "Anpassad för dig"-badge
    break;
  case 'block':
    // Visa alternativ eller dölj
    break;
}
```

### 2. Breathing Engine (`src/breathing/`)

**Filosofi**: Ren logik utan sidoeffekter. Hanterar endast tillstånd och timing.

**Interface**:
```typescript
interface UseBreathEngineReturn {
  state: SessionState;           // Nuvarande fas, progress, etc.
  start: () => void;             // Starta nedräkning
  stop: () => void;              // Avbryt session
  formatTimeRemaining: () => string;
}
```

**Faser**: `ready` → `countdown` → `inhale` → `holdIn` → `exhale` → `holdOut` → `complete`

### 3. State Management (`src/state/`)

**UserState-struktur**:
```typescript
interface UserState {
  id: string;
  onboardingCompleted: boolean;
  baseline: 'calm' | 'neutral' | 'stressed' | 'overstimulated';
  sensitivity: 'low' | 'medium' | 'high';
  contraindications: {
    breathHolds: boolean;
    fastBreathing: boolean;
  };
  capacities: {
    calmBreathing: number;      // 1-5, osynlig för användaren
    focusStability: number;
    energyRegulation: number;
    holdTolerance: number;
  };
  adaptiveFlags: {
    avoidFastBreathing: boolean;
    reduceIntensity: boolean;
    suggestGrounding: boolean;
    extendIntegration: boolean;
  };
  sessionHistory: SessionRecord[];
}
```

**Kapaciteter**: Osynliga för användaren men styr progression och säkerhetsbeslut.

### 4. Övningsdata (`src/data/exercises.ts`)

**Exercise-struktur**:
```typescript
interface Exercise {
  id: string;
  name: string;
  category: 'lugn' | 'fokus' | 'energi';
  pattern: BreathPattern;
  safety: ExerciseSafety;
  createdBy: 'system' | 'coach';  // Framtida coach-funktionalitet
}
```

**Säkerhetsmetadata**:
- `maxIntensity`: 1-5 skala
- `requiresHoldTolerance`: boolean
- `requiresFastBreathingTolerance`: boolean
- `minimumCapacity`: Delmängd av kapaciteter
- `traumaSafeAlternativeId`: Fallback-övning
- `contraindicated`: Vilka villkor som blockerar

---

## Dataflöde

### Session Flow

```
1. HomeScreen
   └─> getRecommendedExercise(userState)
   └─> getSafeExercisesForCategory('lugn', userState)

2. PreparationScreen
   └─> checkExerciseSafety(exercise, userState)
   └─> getRecommendedDuration(exercise, userState)
   └─> Visar anpassat mönster om nödvändigt

3. SessionScreen
   └─> useBreathEngine({ pattern, durationSeconds })
   └─> BreathingCircle visualiserar faserna

4. IntegrationScreen
   └─> getIntegrationConfig(userState, intensity)
   └─> Obligatorisk landningstid

5. FeedbackScreen
   └─> recordSession(exerciseId, feedback)
   └─> Uppdaterar capacities och adaptiveFlags
```

### State Updates

```
recordSession() → updateCapacities() → updateAdaptiveFlags() → saveToStorage()
```

**Kapacitetsuppdatering**:
- `calmer` → +0.2 till relevant kapacitet
- `moreActivated` → sätt protective flags
- `earlyExit` → reduceIntensity = true

---

## Separation av Concerns

### Logic Layer (testbar, sidoeffektfri)

| Modul | Ansvar |
|-------|--------|
| `safetyEngine` | Alla säkerhetsbeslut |
| `useBreathEngine` | Timing och fashantering |
| `exercises.ts` | Data och konfiguration |
| `types.ts` | Interface och typer |

### UI Layer (React-komponenter)

| Skärm | Ansvar |
|-------|--------|
| `OnboardingScreen` | Datainsamling, ej logik |
| `HomeScreen` | Presentation av rekommendationer |
| `PreparationScreen` | Visar säkerhetsstatus |
| `SessionScreen` | Visualisering av andning |
| `IntegrationScreen` | Landning och grounding |
| `FeedbackScreen` | Datainsamling för learning |

---

## Utbyggbarhet

### 1. Lägga till ny övning

```typescript
// src/data/exercises.ts
{
  id: 'my-new-exercise',
  name: 'Ny Övning',
  category: 'lugn',
  pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
  safety: {
    maxIntensity: 1,
    requiresHoldTolerance: false,
    requiresFastBreathingTolerance: false,
    minimumCapacity: {},
    traumaSafeAlternativeId: null,
    contraindicated: {},
  },
  createdBy: 'system',
}
```

Inga UI-ändringar krävs. Safety engine hanterar resten.

### 2. Lägga till ny kategori

1. Uppdatera `Exercise['category']` typen
2. Lägg till färg i `colors.category`
3. Uppdatera `HomeScreen` för att visa ny kategori

### 3. Coach-skapat innehåll

`createdBy: 'coach'` möjliggör framtida funktionalitet:
- Coach-dashboard för att skapa övningar
- Delning av program mellan coach och klient
- Låsbara säkerhetsinställningar

### 4. Backend-integration

Nuvarande arkitektur stödjer enkel migration:
- `UserState` kan synkas till backend
- `exercises` kan hämtas från API
- `sessionHistory` kan lagras för analys

---

## Teknisk Skuld & Förbättringsområden

### Nuvarande

1. **Inga tester** - Safety engine bör ha enhetstester
2. **Hårdkodade texter** - Integration texts bör externaliseras
3. **Begränsad felhantering** - AsyncStorage-fel hanteras basic
4. **Ingen analytics** - Ingen insikt i faktisk användning

### Rekommenderade förbättringar

1. **Test suite** för safety engine
2. **i18n** för flerspråksstöd
3. **Error boundaries** i React
4. **Analytics** (privacy-first)
5. **Haptics** för bättre feedback

---

## Prestandaöverväganden

- **AsyncStorage**: Batch-uppdateringar för att minska I/O
- **Reanimated**: All animation på UI-tråden
- **Session history**: Begränsad till 100 poster
- **Bilder**: Inga tunga assets (SVG-ikoner)

---

## Säkerhetsöverväganden

1. **Ingen PII** - User ID är randomiserad sträng
2. **Lokal lagring** - Ingen data lämnar enheten (än)
3. **Kontraindikationer** - Hårdkodade säkerhetsregler
4. **Adaptive flags** - Lärda preferenser, ej medicinska diagnoser

---

## Versionshistorik

| Version | Förändring |
|---------|-----------|
| 1.0 | Grundläggande MVP |
| 2.0 | Safety engine, capacities, integration |
| 2.1 | Förbättrad separation logic/UI (planerad) |
| 3.0 | Backend, auth, coach-funktionalitet (planerad) |
