# ANDAS - Produktdokumentation

## Vision

**"Den tryggaste och smartaste breathwork-appen för riktiga liv."**

ANDAS är inte en vanlig breathwork-app. Den är designad för människor som:
- Har provat andra appar och känt sig överväldigade
- Har ångest eller trauma i bakgrunden
- Vill ha en säker, progressiv approach
- Värderar enkelhet över mängd

---

## Grundprinciper (Heliga)

### 1. Nervsystem före prestation

Vi optimerar inte för "bäst resultat på kortast tid". Vi optimerar för:
- Långsiktig nervsystemshälsa
- Gradvis kapacitetsuppbyggnad
- Säker utforskning av gränser

### 2. Säkerhet före intensitet

Appen säger ibland **nej**. Det är en feature, inte en bugg.

Exempel:
- Användare med `breathHolds: true` ser inte 4-7-8-andning
- Överstimulerad baseline → endast trauma-säkra övningar
- Två negativa sessioner i rad → automatisk nedtrappning

### 3. Trauma-informerade defaults

- Alla defaults är skonsamma
- Användaren måste aktivt välja intensitet
- Ingen gamification som pushar för hårt
- Tydliga exit-vägar i varje skärm

### 4. Minimal, nordisk UX

- Ingen onödig dekoration
- Tydlig hierarki
- Muted färger (sage, sand, cream)
- Ingen visuell stress

### 5. Progression > innehållsmängd

5 övningar som fungerar > 50 övningar som förvirrar.

Samma övning → djupare upplevelse över tid.

### 6. Integration efter varje session

Obligatorisk landningstid:
- 30-60 sekunder av stillhet
- Roterande grounding-texter
- Mikro-handling för att återvända till vardagen

---

## Konceptuell Modell

### Nervsystemets Tillstånd

```
OVERSTIMULATED (krishantering)
       ↓
   STRESSED (reglering)
       ↓
   NEUTRAL (underhåll)
       ↓
     CALM (djup vila)
```

Appen möter användaren där de är och hjälper dem ett steg neråt.

### Osynliga Kapaciteter

Användaren ser inte dessa, men de styr upplevelsen:

| Kapacitet | Vad den mäter | Påverkar |
|-----------|---------------|----------|
| `calmBreathing` | Förmåga att lugna sig | Längd på lugn-sessioner |
| `focusStability` | Förmåga att hålla fokus | Tillgång till fokus-övningar |
| `energyRegulation` | Förmåga att reglera energi | Tillgång till energi-övningar |
| `holdTolerance` | Komfort med andningspauser | Anpassning av håll-tider |

### Adaptiva Flaggor

Lärda preferenser från feedback:

| Flagga | Triggas av | Effekt |
|--------|-----------|--------|
| `avoidFastBreathing` | "Mer aktiverad" på snabb övning | Blockerar snabba övningar |
| `reduceIntensity` | "Mer aktiverad" eller early exit | Kortare håll, längre integration |
| `suggestGrounding` | Två negativa i rad | Prioriterar grounding-övningar |
| `extendIntegration` | Högintensiv övning + negativ feedback | 60s integration istället för 30s |

---

## Användarresan

### Onboarding (3 frågor)

1. **Baseline**: "Hur brukar du känna dig i vardagen?"
   - Sätter `baseline` och initial `sensitivity`

2. **Erfarenhet**: "Har du provat andningsövningar förut?"
   - Sätter initiala `capacities`

3. **Kontraindikationer**: "Finns något av detta?"
   - Sätter `contraindications`
   - Ingen blir utesluten - bara anpassad

### Daglig Användning

```
Öppna app → Se rekommendation → Förberedelse → Session → 
Integration → Feedback → Uppdaterad modell
```

### Progression över Tid

**Vecka 1-2**: Bara LUGN-övningar, korta sessioner
**Vecka 3-4**: Längre sessioner baserat på feedback
**Vecka 5+**: FOKUS-övningar kan bli tillgängliga
**Månad 3+**: ENERGI-övningar om kapaciteten finns

---

## Säkerhetsfilosofi

### Vad vi INTE gör

❌ **Ingen biohacker-machokultur**
- Inga "push through the discomfort"-meddelanden
- Inga streaks som skapar prestationsångest
- Inga ledartavlor

❌ **Ingen flummig spiritualitet**
- Inga chakras, energier, eller "higher consciousness"
- Inga obligatoriska intentioner
- Inga "trust the universe"

❌ **Ingen stressande gamification**
- Inga push-notiser om "du har missat en dag"
- Inga badges för "7 dagar i rad"
- Inga påminnelser om att "komma ikapp"

### Vad vi GÖR

✅ **Säkerhet först**
- Tydliga varningar vid kontraindikationer
- Automatiska anpassningar baserat på feedback
- Tydliga exit-vägar

✅ **Trauma-informerad**
- Alltid en "trygg övning" tillgänglig
- Ingen shame vid early exit
- Grounding efter varje session

✅ **Transparent**
- "Anpassad för dig" visas när vi ändrar något
- "Ej tillgänglig just nu" med förklaring
- Användaren ser sin baseline (om de vill)

---

## Differentiering

| Aspekt | ANDAS | Traditionella appar |
|--------|-------|---------------------|
| **Safety** | Integrerad i varje beslut | Disclaimer i början |
| **Progression** | Osynlig, kapacitetsbaserad | Spellistor, nivåer |
| **Integration** | Obligatorisk, anpassad | Valbar eller saknas |
| **UX** | Minimal, nordisk | Feature-rik, komplex |
| **Approach** | Nervsystem-först | Teknik-först |
| **Gamification** | None | Streaks, badges |

---

## Framtida Vision

### Nära term (6 månader)

- [ ] FOKUS-kategori fullt implementerad
- [ ] Förbättrad feedback-loop
- [ ] Veckovis sammanfattning (valbar)
- [ ] Bättre ljud (valbara bakgrundsljud)

### Medel term (12 månader)

- [ ] ENERGI-kategori
- [ ] Backend för sync
- [ ] Coach-portal (skapa övningar)
- [ ] Program-delning

### Lång term (24 månader)

- [ ] HRV-integration (valbar)
- [ ] Terapeut-integration
- [ ] Forskningssamarbete
- [ ] Fler språk

---

## Framgångsmått

### Primära (användarupplevelse)

- % sessioner som avslutas utan early exit
- % positiv feedback ("lugnare")
- Retention dag 7, 30, 90
- NPS (Net Promoter Score)

### Sekundära (produktutveckling)

- Genomsnittlig kapacitetsökning över tid
- Antal säkerhetsanpassningar per användare
- Tid till första positiva feedback

### Att INTE mäta

- Antal övningar provade
- Total tid i appen
- Streak-längd
- Social delning

---

## Etiska Riktlinjer

1. **Ingen medicinsk rådgivning** - Alltid hänvisa till professionell vård
2. **Ingen beroendeframkallande design** - Inga dark patterns
3. **Privacy by design** - Data stannar på enheten som default
4. **Inkludering** - Ingen blir utesluten pga hälsotillstånd
5. **Transparens** - Användaren förstår varför vi rekommenderar det vi gör

---

## Sammanfattning

ANDAS är en breathwork-app för människor som vill ha något annat än "ännu en app". Den är:

- **Säker** - Safety är inte en feature, det är fundamentet
- **Smart** - Lär sig av användaren utan att vara påträngande
- **Enkel** - Ingen onödig komplexitet
- **Respektfull** - Respekterar användarens gränser och tempo

Detta är grunden för ett seriöst bolag inom nervsystemshälsa.
