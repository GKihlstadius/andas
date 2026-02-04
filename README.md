# ANDAS v1.1.0

> **Den tryggaste och smartaste breathwork-appen för riktiga liv.**

[![Version](https://img.shields.io/badge/version-1.1.0-7A9181.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-7A9181.svg)](LICENSE)

## 🌿 Om ANDAS

ANDAS är en nervsystem-intelligent breathwork-app med **safety-first** som kärna. Till skillnad från andra appar som pushar för intensitet, möter ANDAS dig där du är och anpassar övningarna efter ditt nervsystemstillstånd.

### Grundprinciper

- ✅ **Safety före intensitet** - Appen säger ibland nej, och det är för din säkerhet
- ✅ **Trauma-informerade defaults** - Alla övningar är skonsamma som standard
- ✅ **Minimal, nordisk UX** - Ingen onödig komplexitet
- ✅ **Ingen gamification** - Ingen stress, ingen manipulation
- ✅ **Integration efter varje session** - Obligatorisk landningstid

## 📱 Preview

**[🚀 Prova ANDAS i webbläsaren](https://zz266bjdakw6i.ok.kimi.link)**

*Notera: Detta är en webb-preview. Den faktiska appen har ytterligare funktionalitet och native prestanda.*

## ✨ Funktioner

### LUGN-kategori (Nedreglering)
- **Fysiologisk suck** - Snabb nedreglering
- **Koherent andning** - Hjärt-hjärna synk
- **Förlängd utandning** - 4-6 andning
- **4-7-8 andning** - Sömn och vila
- **Trygg andning** - Extra skonsam för alla

### FOKUS-kategori (Stabil närvaro)
- **Box breathing** - Fyrkant för stabilitet
- **Mjuk fokus** - Närvaro utan ansträngning
- **Jordande andning** - Förankring i nuet

### 🆕 v1.1.0 - Nya funktioner

#### 🌍 Internationalisering
- Svenska (standard) och Engelska
- Automatisk språkdetektering
- Alla texter översatta

#### 🔊 Ljudguidning
- Fasövergångstoner (in-/utandning)
- Haptisk feedback (vibration)
- Bakgrundsljud (regn, hav, skog, vitt brus)
- Volymkontroll

#### 💓 HRV-integration
- Apple Health/HealthKit-anslutning
- HRV och vilohertfrekvens
- Nervsystemsanalys
- Personliga rekommendationer

#### 📊 Veckosammanfattning
- Statistik och grafer
- Streak-räkning
- Personliga insikter
- Trendanalys

#### 👨‍⚕️ Terapeutdelning
- Generera detaljerad rapport
- Mönster- och feedbackanalys
- Dela via standardverktyg

### Safety Engine
- Kontraindikations-kontroll (breathHolds, fastBreathing)
- Dynamisk anpassning baserat på användartillstånd
- Baseline-medvetna rekommendationer
- Sensitivity-baserade justeringar
- Kapacitets-progression
- Adaptiva flaggor från feedback

## 🏗️ Teknikstack

- **React Native** + **Expo** + **TypeScript**
- **React Navigation** - Navigation
- **AsyncStorage** - Lokal persistens med backup
- **Reanimated** - Animationer
- **Jest** - Unit testing

## 🚀 Kom igång

```bash
# Klona repot
git clone https://github.com/GKihlstadius/andas.git
cd andas

# Installera dependencies
npm install

# Starta utvecklingsserver
npm start

# Kör tester
npm test
```

## 📁 Projektstruktur

```
andas/
├── src/
│   ├── safety/           # Safety Engine (kärnbusinesslogik)
│   ├── screens/          # Skärmkomponenter
│   ├── components/       # Återanvändbara komponenter
│   ├── state/            # State management med säker lagring
│   ├── audio/            # Ljudguidning
│   ├── analytics/        # Etisk, lokal analytics
│   ├── data/             # Typer, konstanter, övningar
│   ├── breathing/        # Andningsmotor
│   ├── navigation/       # Navigation
│   └── hooks/            # Custom hooks
├── app-store/            # App Store assets
├── docs/                 # Dokumentation
└── ...
```

## 🧪 Testning

```bash
# Kör alla tester
npm test

# Kör tester i watch-läge
npm run test:watch
```

Safety Engine har omfattande unit-tester som täcker alla kritiska paths.

## 📋 App Store

- **Namn:** ANDAS
- **Subtitle:** Trygg breathwork för riktiga liv
- **Kategori:** Health & Fitness
- **Privacy:** All data stannar på enheten

Se [app-store/TESTFLIGHT_CHECKLIST.md](app-store/TESTFLIGHT_CHECKLIST.md) för lanseringschecklista.

## 📖 Dokumentation

- [Produktdokumentation](docs/PRODUCT_DOCUMENTATION.md) - Vision och principer
- [Teknisk dokumentation](docs/TECHNICAL_DOCUMENTATION.md) - Arkitektur och dataflöde
- [Build Guide](docs/BUILD_GUIDE.md) - Hur man bygger vidare
- [Marknadsanalys](docs/MARKET_ANALYSIS.md) - Konkurrentanalys
- [Ärlig kritik](docs/HONEST_CRITIQUE.md) - Vad som saknas och nästa steg

## 🔒 Säkerhetsgarantier

ANDAS garanterar:

- ✅ **Aldrig** tillåta breathHolds för användare med den kontraindikationen
- ✅ **Aldrig** tillåta fastBreathing för användare med den kontraindikationen
- ✅ **Alltid** ha en trauma-safe alternative
- ✅ **Alltid** respektera användarens baseline state
- ✅ **Alltid** tillhandahålla tydliga exit-vägar
- ✅ **Aldrig** använda engagement tricks eller dark patterns

## 📝 Versionhistorik

Se [CHANGELOG_v1.md](CHANGELOG_v1.md)

## 🤝 Bidra

Detta är ett seriöst projekt inom nervsystemshälsa. Alla bidrag måste:

1. Respektera produktens grundprinciper
2. Prioritera säkerhet över features
3. Följa den nordiska, minimalistiska designen
4. Inkludera tester för säkerhetskritisk kod

## 📄 Licens

MIT License - se [LICENSE](LICENSE) för detaljer.

## 🙏 Tack till

- Alla som delat med sig av sina erfarenheter av breathwork
- Terapeuter och forskare inom trauma-informed care
- React Native- och Expo-communityt

---

<p align="center">
  <strong>ANDAS</strong> - Nervsystem-intelligent andning
</p>

<p align="center">
  <sub>Byggt med 💚 för riktiga liv</sub>
</p>
