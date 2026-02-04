# ANDAS - "Hur Man Bygger Vidare"-Guide

## För Utvecklare

Denna guide hjälper dig att förstå hur du bygger vidare på ANDAS utan att bryta dess grundprinciper.

---

## Innan Du Börjar

### Läs Detta Först

1. `PRODUCT_DOCUMENTATION.md` - Förstå visionen
2. `TECHNICAL_DOCUMENTATION.md` - Förstå arkitekturen
3. Denna fil - Praktisk guide

### Grundregler

✅ **Gör detta:**
- Fråga "hur påverkar detta nervsystemet?"
- Testa med högkänsliga användare
- Håll UI minimalt
- Separera logik från presentation

❌ **Gör inte detta:**
- Lägg till features bara för att
- Öka kognitiv load utan god anledning
- Ignorera säkerhetsmotorn
- Bygg AI för AI:s skull

---

## Vanliga Utbyggnadsscenarier

### 1. Lägga till en Ny Övning

**Steg:**

1. **Definiera övningen i `src/data/exercises.ts`**:

```typescript
{
  id: 'my-exercise',           // Unikt ID
  name: 'Mitt Namn',           // Svenskt namn
  category: 'lugn',            // lugn | fokus | energi
  shortDescription: 'Kort beskrivning',
  description: 'Längre beskrivning',
  pattern: {
    inhale: 4,                 // sekunder
    holdIn: 0,                 // 0 om ingen paus
    exhale: 6,
    holdOut: 0,
  },
  defaultMinutes: 5,           // eller defaultRounds
  defaultRounds: null,
  guidance: {
    start: 'Instruktion i början',
    mid: null,                 // eller instruktion mitt i
    end: 'Instruktion i slutet',
  },
  safety: {
    maxIntensity: 1,           // 1-5, var konservativ
    requiresHoldTolerance: false,
    requiresFastBreathingTolerance: false,
    minimumCapacity: {},       // eller { calmBreathing: 2 }
    traumaSafeAlternativeId: null,  // eller 'coherent'
    contraindicated: {},       // eller { breathHolds: true }
  },
  createdBy: 'system',
}
```

2. **Testa säkerhetsintegrationen**:

```typescript
// I en testfil eller konsol
import { checkExerciseSafety } from '../safety';
import { exercises } from '../data/exercises';

const exercise = exercises.find(e => e.id === 'my-exercise');
const userState = { /* test state */ };
const result = checkExerciseSafety(exercise, userState);
console.log(result);
```

3. **Verifiera UI**:
- Övningen visas automatiskt i rätt kategori
- Safety badges visas om anpassad
- Blockerade övningar visas ej eller med alternativ

**Checklista:**
- [ ] Övningen har unikt ID
- [ ] Svenskt namn och beskrivning
- [ ] Konservativ intensity-rating
- [ ] Trauma-safe alternative om intensity > 2
- [ ] Testad med olika user states

---

### 2. Lägga till en Ny Kategori

**Steg:**

1. **Uppdatera typen** (`src/data/types.ts`):

```typescript
export interface Exercise {
  // ...
  category: 'lugn' | 'fokus' | 'energi' | 'min-nya-kategori';
  // ...
}
```

2. **Lägg till färg** (`src/data/constants.ts`):

```typescript
export const colors = {
  // ...
  category: {
    lugn: '#7A9181',
    fokus: '#7A8391',
    energi: '#91847A',
    'min-nya-kategori': '#91817A',  // Din färg
  },
  // ...
};
```

3. **Uppdatera HomeScreen** (`src/screens/HomeScreen.tsx`):

```typescript
// Lägg till ny sektion
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Min Nya Kategori</Text>
  <View style={styles.exerciseList}>
    {getSafeExercisesForCategory('min-nya-kategori', userState)
      .map(({ exercise, safetyResult }) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          safetyResult={safetyResult}
          onPress={() => handleExercisePress(exercise.id)}
        />
      ))}
  </View>
</View>
```

**Checklista:**
- [ ] Typ uppdaterad
- [ ] Färg vald (följ befintlig palett)
- [ ] HomeScreen uppdaterad
- [ ] Testad med olika states

---

### 3. Modifiera Säkerhetslogik

**Varning**: Detta är känsligt. Läs safety engine noggrant först.

**Exempel: Lägg till ny kontraindikation**

1. **Uppdatera typen** (`src/data/types.ts`):

```typescript
export interface Contraindications {
  breathHolds: boolean;
  fastBreathing: boolean;
  myNewCondition: boolean;  // Ny
}
```

2. **Uppdatera default state** (`src/state/userState.ts`):

```typescript
export const DEFAULT_USER_STATE: UserState = {
  // ...
  contraindications: {
    breathHolds: false,
    fastBreathing: false,
    myNewCondition: false,  // Ny
  },
  // ...
};
```

3. **Uppdatera onboarding** (`src/data/exercises.ts`):

```typescript
{
  id: 'contraindications',
  question: 'Finns något av detta?',
  options: [
    // ... befintliga options
    {
      id: 'my-condition',
      label: 'Min nya condition',
      effects: {
        contraindications: { myNewCondition: true },
      },
    },
  ],
}
```

4. **Uppdatera safety engine** (`src/safety/safetyEngine.ts`):

```typescript
export function checkExerciseSafety(exercise, userState) {
  // ... befintliga checks
  
  if (safety.contraindicated.myNewCondition && contraindications.myNewCondition) {
    return {
      allowed: false,
      reason: 'myNewCondition',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }
  
  // ...
}
```

5. **Uppdatera exercise safety**:

```typescript
{
  // ... exercise definition
  safety: {
    // ...
    contraindicated: { myNewCondition: true },
  },
}
```

**Checklista:**
- [ ] Typ uppdaterad
- [ ] Default state uppdaterad
- [ ] Onboarding uppdaterad
- [ ] Safety engine uppdaterad
- [ ] Relevanta övningar uppdaterade
- [ ] Testad med olika kombinationer

---

### 4. Lägga till Ljud

**Filosofi**: Ljud ska vara valbart och icke-påträngande.

**Steg:**

1. **Lägg till ljudfiler** i assets-mappen

2. **Skapa ljud-hook** (`src/hooks/useAudio.ts`):

```typescript
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const playBackground = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, isLooping: true, volume: 0.3 }
    );
    soundRef.current = sound;
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
  };

  useEffect(() => {
    return () => { stop(); };
  }, []);

  return { playBackground, stop };
}
```

3. **Integrera i SessionScreen**:

```typescript
// I SessionScreen
const { playBackground, stop } = useAudio();

useEffect(() => {
  if (userState.preferences.backgroundSound) {
    playBackground(getSoundForCategory(exercise.category));
  }
  return () => stop();
}, []);
```

4. **Lägg till inställning**:

```typescript
// I userState
preferences: {
  backgroundSound: boolean;
  soundVolume: number;
}
```

**Checklista:**
- [ ] Ljud valbart (default: av)
- [ ] Volym låg (max 30%)
- [ ] Ljud stoppas vid early exit
- [ ] Testad med olika enheter

---

### 5. Lägga till Notiser

**Filosofi**: Notiser ska vara hjälpsamma, inte påträngande.

**Tillåtna notiser:**
- "Din dagliga andning är redo" (om användaren bett om den)
- "Det har gått 3 dagar sedan sist" (valbar)

**Förbjudna notiser:**
- "Du har missat 2 dagar!"
- "Kom tillbaka!"
- Streak-påminnelser

**Steg:**

1. **Begär tillstånd** vid onboarding (valbart)

2. **Skapa notis-service**:

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ta ett andetag',
      body: 'Din dagliga andning är redo när du är.',
    },
    trigger: {
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeats: true,
    },
  });
}
```

3. **Inställningar**:

```typescript
// I settings screen
<Toggle
  label="Daglig påminnelse"
  value={userState.preferences.dailyReminder}
  onChange={handleToggleReminder}
/>
{userState.preferences.dailyReminder && (
  <TimePicker
    value={userState.preferences.reminderTime}
    onChange={handleTimeChange}
  />
)}
```

---

## Teststrategi

### Enhetstester för Safety Engine

```typescript
// src/safety/__tests__/safetyEngine.test.ts
import { checkExerciseSafety } from '../safetyEngine';

describe('checkExerciseSafety', () => {
  const baseUserState = {
    baseline: 'neutral',
    sensitivity: 'medium',
    contraindications: { breathHolds: false, fastBreathing: false },
    capacities: { calmBreathing: 2, focusStability: 2, energyRegulation: 2, holdTolerance: 2 },
    adaptiveFlags: { avoidFastBreathing: false, reduceIntensity: false, suggestGrounding: false, extendIntegration: false },
  };

  it('should block 4-7-8 for users with breathHolds contraindication', () => {
    const userState = { ...baseUserState, contraindications: { ...baseUserState.contraindications, breathHolds: true } };
    const exercise = exercises.find(e => e.id === '478');
    const result = checkExerciseSafety(exercise, userState);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('breathHolds');
    expect(result.alternativeId).toBe('extended-exhale');
  });

  it('should adapt pattern for high sensitivity', () => {
    const userState = { ...baseUserState, sensitivity: 'high' };
    const exercise = exercises.find(e => e.id === 'box');
    const result = checkExerciseSafety(exercise, userState);
    expect(result.allowed).toBe(true);
    expect(result.adaptedPattern).not.toBeNull();
    expect(result.adaptedPattern.holdIn).toBeLessThanOrEqual(2);
  });
});
```

### Integrationstester

```typescript
// Testa hela flödet
// 1. Onboarding → 2. Home → 3. Preparation → 4. Session → 5. Integration → 6. Feedback
```

### Manuella Tester

**Med verkliga användare:**
- Person med ångest
- Person med trauma
- Person som aldrig provat breathwork
- Person som gör det regelbundet

**Testscenarier:**
1. Första sessionen
2. Early exit
3. "Mer aktiverad" feedback
4. 7 dagars användning
5. Byte av baseline

---

## Vanliga Misstag

### Misstag 1: För snabb progression

❌ **Fel:**
```typescript
// Ger tillgång till energi-övningar efter 3 dagar
if (userState.currentDayInProgram > 3) {
  showEnergyCategory();
}
```

✅ **Rätt:**
```typescript
// Baseras på kapacitet och feedback
if (userState.capacities.energyRegulation >= 3 && 
    hasPositiveFeedbackStreak(3)) {
  showEnergyCategory();
}
```

### Misstag 2: För mycket information

❌ **Fel:**
```typescript
// Visar alla kapaciteter för användaren
<Text>Din calmBreathing: {userState.capacities.calmBreathing}</Text>
```

✅ **Rätt:**
```typescript
// Osynlig för användaren, används för anpassning
// Visa bara om det påverkar upplevelsen
{isAdapted && <SafetyBadge reason={reason} />}
```

### Misstag 3: Ignorera safety engine

❌ **Fel:**
```typescript
// Direkt navigering utan säkerhetskontroll
onPress={() => navigation.navigate('Session', { exerciseId })}
```

✅ **Rätt:**
```typescript
const safetyResult = checkExerciseSafety(exercise, userState);
if (!safetyResult.allowed) {
  showAlternative(safetyResult.alternativeId);
  return;
}
// ... navigera
```

---

## Kodreview Checklista

Innan du skickar en PR:

- [ ] Koden följer befintlig stil
- [ ] Nya funktioner har JSDoc-kommentarer
- [ ] Safety engine är konsulterad vid relevanta ändringar
- [ ] UI är testat på både iOS och Android
- [ ] Accessibility är beaktad (kontrast, storlek)
- [ ] Ingen onödig komplexitet
- [ ] Ingen duplicerad kod

---

## Resurser

### Läsning

- [Polyvagal Theory - Stephen Porges](https://www.amazon.com/Polyvagal-Theory-Neurophysiological-Foundations-Emotions/dp/0393707008)
- [The Body Keeps the Score - Bessel van der Kolk](https://www.amazon.com/Body-Keeps-Score-Healing-Trauma/dp/0143127748)
- [Trauma-Sensitive Yoga - David Emerson](https://www.amazon.com/Overcoming-Trauma-through-Yoga-Reclaiming/dp/1556439695)

### Verktyg

- React Native Debugger
- Flipper för state-inspektion
- React DevTools för komponent-träd

---

## Kontakt

Vid frågor om arkitektur eller produktbeslut, konsultera:
1. Produktdokumentationen
2. Teknisk dokumentation
3. Befintlig kod (den är källan till sanning)

Kom ihåg: **Nervsystem före prestation. Alltid.**
