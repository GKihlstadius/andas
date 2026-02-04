# ANDAS v1 - Scope Definition (LÅST)

**Datum**: 2026-02-03  
**Status**: FROZEN - Inga ändringar utan explicit godkännande

---

## Vad ANDAS v1 ÄR

En nervsystem-intelligent breathwork-app med safety-first som kärna.

### Innehåller

| Feature | Status | Beskrivning |
|---------|--------|-------------|
| LUGN-kategori | ✅ Existerar | 5 övningar, trauma-safe defaults |
| FOKUS-kategori | 🔄 Lägg till | 3 övningar, low-arousal fokus |
| Safety Engine | ✅ Existerar | v1 + v2 bakåtkompatibel |
| Unit Tests | 🔄 Lägg till | Kritiska paths i safety engine |
| AsyncStorage-skydd | 🔄 Lägg till | Fallback vid korruption |
| Ljudguidning | 🔄 Lägg till | Icke-verbal, valbar, default på |
| Onboarding | ✅ Existerar | Förbättra copy |
| Integration | ✅ Existeras | Obligatorisk landning |
| Feedback | ✅ Existerar | Uppdaterar capacities |
| Minimal Analytics | 🔄 Lägg till | Etisk, lokal |
| App Store-assets | 🔄 Lägg till | Ikon, beskrivning, privacy policy |

---

## Vad ANDAS v1 INTE är (medvetet uteslutet)

| Feature | Varför uteslutet | När/vi bygger |
|---------|------------------|---------------|
| ENERGI-kategori | För högt arousal, riskabelt | v2 med HRV-validering |
| Sociala funktioner | Urholkar trygghet | Troligen aldrig |
| Gamification | Stressande, manipulativt | Aldrig |
| Push-notiser | Påträngande | Endast om användaren ber om det |
| Voice-over | För komplext för v1 | v2 om behov finns |
| Backend/Sync | Scope creep | v2 |
| Auth | Onödigt för v1 | v2 |
| i18n | Scope creep | Efter lansering |
| HRV-integration | För avancerat | v2 |
| Coach-portal | B2B, inte v1 | v2 |

---

## Definition of Done för v1

### Stabilitet & Säkerhet
- [ ] Unit tests för alla safety-kritiska paths
- [ ] AsyncStorage-fel hanteras graceful
- [ ] Ingen session kan eskalera felaktigt
- [ ] Deterministiskt fallback-beteende

### Ljud
- [ ] Icke-verbal ljudguidning (toner för faser)
- [ ] Valbar on/off i settings
- [ ] Default: på, 30% volym
- [ ] Stödjer nedreglering (aldrig stressar)

### UX
- [ ] Onboarding förklarar varför appen ibland säger nej
- [ ] Copy är trygg, vuxen, nordisk
- [ ] Tomma states hanteras lugnt
- [ ] Session → Integration → Exit är smidigt

### FOKUS-kategori
- [ ] 3 övningar: Box breathing, 4-4-4-4, Soft Focus
- [ ] Alla max intensity 2
- [ ] Trauma-safe alternatives
- [ ] Ingen snabb andning

### Analytics (Etisk)
- [ ] session_started (lokal)
- [ ] session_completed (lokal)
- [ ] negative_feedback_flag (lokal)
- [ ] Ingen export, ingen backend

### App Store
- [ ] App-ikon (placeholder OK)
- [ ] App-beskrivning (ärlig, icke-hype)
- [ ] Privacy policy (local-only)
- [ ] Inga medical claims

---

## Testkrav

### Unit Tests
- [ ] checkExerciseSafety för alla kontraindikationer
- [ ] Adaptation logic (high sensitivity, low hold tolerance)
- [ ] Block logic (overstimulated, contraindications)
- [ ] Capacity progression
- [ ] Edge cases (null/undefined inputs)

### Integration Tests
- [ ] Fullt flöde: Onboarding → Home → Session → Integration → Feedback
- [ ] Early exit hantering
- [ ] Negative feedback → adaptive flags

### Manuella Tester
- [ ] Överstimulerad användare (alla övningar ska vara safe)
- [ ] Kontraindikationer (breathHolds, fastBreathing)
- [ ] Negativa streaks (app ska nedtrappa)
- [ ] Ljudguidning (fungerar med stängda ögon)

---

## Versionsnummer

**v1.0.0** - Första publika versionen

---

## Godkännande

Detta scope är låst. Ändringar kräver:
1. Motivering
2. Impact-analys
3. Nytt godkännande
