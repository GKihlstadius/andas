# ANDAS Changelog

## v1.1.0 (2026-02-03)

### 🎉 Nya funktioner

#### Ljudguidning (Audio System)
- ✅ Fasövergångstoner (inhale, exhale, complete)
- ✅ Solfeggio-inspirerade frekvenser (528Hz, 396Hz, 432Hz)
- ✅ Bakgrundsljud (regn, hav, skog, vitt brus)
- ✅ Haptisk feedback vid fasövergångar
- ✅ Volymkontroll för toner och bakgrund
- ✅ Inställningar sparas persistent

#### HRV-integration (Apple Health)
- ✅ HealthKit-integration för iOS
- ✅ HRV-datahämtning (senaste 7 dagarna)
- ✅ Vilopuls-spårning
- ✅ Nervsystemsanalys baserad på HRV
- ✅ Trendanalys (förbättras/stabil/försämras)
- ✅ Personanpassade övningsrekommendationer
- ✅ Manuell HRV-inmatning
- ✅ Session HRV-registrering (före/efter)

#### Veckosammanfattning (Progress Screen)
- ✅ Veckovis statistik (sessioner, minuter)
- ✅ Stapeldiagram för sessioner per dag
- ✅ Stapeldiagram för minuter per dag
- ✅ Streak-räknare (dagar i rad)
- ✅ Mest använda övningen
- ✅ Personliga insikter och tips
- ✅ Snittlängd på sessioner

#### Terapeutdelning
- ✅ Generera terapeutrapport (30 dagars data)
- ✅ Sammanfattning av sessioner och feedback
- ✅ Mönsteranalys (tid på dagen, regelbundenhet)
- ✅ Trendanalys
- ✅ Automatiska rekommendationer
- ✅ Dela via systemets dela-funktion
- ✅ Stöd för svenska och engelska rapporter

#### Internationalisering (i18n)
- ✅ Svenska (standardspråk)
- ✅ Engelska
- ✅ Automatisk systemspråksdetektion
- ✅ Manuellt språkbyte i inställningar
- ✅ Persistenta språkinställningar
- ✅ Komplett översättning av alla skärmar

#### Nya skärmar
- ✅ Progress Screen (Framsteg)
- ✅ History Screen (Historik)
- ✅ Settings Screen (Inställningar)
- ✅ Tab-navigation med 4 flikar

### 📦 Nya beroenden

- expo-localization
- @react-navigation/bottom-tabs
- react-native-health
- i18n-js

---

## v1.0.0

### Funktioner
- LUGN-kategori (5 övningar)
- FOKUS-kategori (3 övningar)  
- Safety Engine v1 + v2
- Unit tests för safety engine
- AsyncStorage med backup
- Onboarding flow
- Session → Integration → Feedback flow
