# ANDAS v1.0.0 - Changelog

## Release Date
2026-02-03

## Overview
First public release of ANDAS - a nervous system-intelligent breathwork app with safety-first as its core principle.

## Features

### LUGN Category (Calming)
- **Physiological Sigh** - Quick downregulation
- **Coherent Breathing** - Heart-brain synchronization
- **Extended Exhale** - 4-6 breathing
- **4-7-8 Breathing** - Sleep and rest (with hold)
- **Trauma-Safe** - Extra gentle, no holds

### FOKUS Category (Stable Presence)
- **Box Breathing** - Square for stability
- **Soft Focus** - Presence without effort
- **Grounding Breath** - Anchoring in the present

### Safety Engine
- Contraindication checking (breathHolds, fastBreathing)
- Dynamic adaptation based on user state
- Baseline-aware recommendations
- Sensitivity-based adjustments
- Capacity progression tracking
- Adaptive flags from feedback

### Session Flow
- Visual breathing guidance
- Phase-based animation
- Time remaining display
- Cycle counter
- Early exit handling

### Integration
- Mandatory landing period (30-60s)
- Rotating grounding texts
- Micro-action suggestions
- Duration based on intensity

### User State
- Persistent storage with backup
- Graceful error handling
- Session history (100 entries)
- Capacity tracking
- Adaptive flag management

### Analytics (Local Only)
- Session started/completed
- Negative feedback tracking
- Early exit tracking
- No personal data
- No network calls

## Technical

### Architecture
- React Native + Expo + TypeScript
- Clean separation of concerns
- Testable safety engine
- Backup-enabled storage

### Dependencies
- expo-av (audio)
- expo-haptics (haptics)
- react-native-reanimated (animations)
- @react-native-async-storage/async-storage (persistence)

### Testing
- Unit tests for safety engine
- Edge case coverage
- Safety invariant tests

## Known Limitations

### v1.0.0
- Audio is placeholder (requires audio files for production)
- Only Swedish language
- No backend sync
- No coach portal
- No HRV integration

## What's Not Included (Intentionally)

- ENERGI category (high arousal - too risky for v1)
- Social features
- Gamification
- Push notifications
- Voice-over guidance
- Backend/Auth
- i18n

## Safety Commitment

ANDAS v1.0.0 has been built with the following safety commitments:

1. **Never** allow breathHolds for users with that contraindication
2. **Never** allow fastBreathing for users with that contraindication
3. **Always** have a trauma-safe alternative
4. **Always** respect the user's baseline state
5. **Always** provide clear exit paths
6. **Never** use engagement tricks or dark patterns

## Next Version (v1.1.0 - Planned)

- [ ] Audio files for breath guidance
- [ ] English language support
- [ ] Bug fixes from v1.0.0 feedback
- [ ] Performance improvements

---

**Version:** 1.0.0  
**Codename:** Trygg (Safe)  
**Status:** Ready for TestFlight
