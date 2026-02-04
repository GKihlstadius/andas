# ANDAS - Dokumentation

Detta är den kompletta dokumentationen för ANDAS - en nervsystem-intelligent breathwork-app.

## Dokument

### För alla

- [**PRODUCT_DOCUMENTATION.md**](PRODUCT_DOCUMENTATION.md) - Vision, grundprinciper, konceptuell modell
- [**WHY_ANDAS_WINS.md**](WHY_ANDAS_WINS.md) - Varför ANDAS är överlägset konkurrenterna
- [**MARKET_ANALYSIS.md**](MARKET_ANALYSIS.md) - Jämförelse med ledande breathwork-appar
- [**HONEST_CRITIQUE.md**](HONEST_CRITIQUE.md) - Ärlig kritik och nästa steg

### För utvecklare

- [**TECHNICAL_DOCUMENTATION.md**](TECHNICAL_DOCUMENTATION.md) - Arkitektur, dataflöde, utbyggbarhet
- [**BUILD_GUIDE.md**](BUILD_GUIDE.md) - Hur man bygger vidare utan att bryta principerna

## Snabbstart

### Förstå produkten
1. Läs [PRODUCT_DOCUMENTATION.md](PRODUCT_DOCUMENTATION.md)
2. Läs [WHY_ANDAS_WINS.md](WHY_ANDAS_WINS.md)

### Förstå tekniken
1. Läs [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
2. Läs [BUILD_GUIDE.md](BUILD_GUIDE.md)

### Förstå marknaden
1. Läs [MARKET_ANALYSIS.md](MARKET_ANALYSIS.md)
2. Läs [HONEST_CRITIQUE.md](HONEST_CRITIQUE.md)

## Kärnprinciper (Sammanfattning)

1. **Nervsystem före prestation**
2. **Säkerhet före intensitet**
3. **Trauma-informerade defaults**
4. **Minimal, nordisk UX**
5. **Progression > innehållsmängd**
6. **Integration efter varje session**

## Arkitekturöversikt

```
src/
├── breathing/          # Andningsmotor (pure logic)
├── components/         # UI-komponenter
├── data/              # Typer, konstanter, övningar
├── navigation/        # Routing
├── safety/            # Safety engine (core business logic)
├── screens/           # Skärmkomponenter
├── state/             # Global state
└── hooks/             # Custom hooks
```

## Viktiga Filer

- `src/safety/safetyEngine.ts` - Grundläggande safety logic
- `src/safety/safetyEngine.v2.ts` - Utökad safety logic (ny)
- `src/state/userState.ts` - State management
- `src/data/exercises.ts` - Övningsbibliotek
- `src/data/types.ts` - TypeScript interfaces

## Utveckling

### Lägga till en ny övning

Se [BUILD_GUIDE.md](BUILD_GUIDE.md) avsnitt "1. Lägga till en Ny Övning"

### Modifiera säkerhetslogik

Se [BUILD_GUIDE.md](BUILD_GUIDE.md) avsnitt "3. Modifiera Säkerhetslogik"

### Köra appen

```bash
npm install
npx expo start
```

## Kontakt

För frågor om arkitektur eller produktbeslut, konsultera dokumentationen först.

---

> *"Detta är grunden till ett seriöst bolag inom nervsystemshälsa."*
