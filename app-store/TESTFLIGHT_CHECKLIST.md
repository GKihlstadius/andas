# ANDAS v1 - TestFlight / App Store Checklist

## Pre-Submission Checklist

### Code Quality
- [ ] All unit tests pass
- [ ] No console.log statements in production code
- [ ] No TODO comments in production code
- [ ] Error boundaries implemented
- [ ] AsyncStorage errors handled gracefully

### App Store Requirements
- [ ] App icon (1024x1024)
- [ ] Screenshot set (iPhone + iPad)
- [ ] App description (Swedish + English)
- [ ] Keywords
- [ ] Support URL
- [ ] Privacy policy URL
- [ ] Marketing URL (optional)

### Functionality
- [ ] Onboarding works
- [ ] LUGN category displays correctly
- [ ] FOKUS category displays correctly
- [ ] Safety engine blocks correctly
- [ ] Safety engine adapts correctly
- [ ] Session flow works end-to-end
- [ ] Integration screen displays
- [ ] Feedback updates state
- [ ] Settings reset works

### Safety
- [ ] breathHolds contraindication blocks 4-7-8 and box
- [ ] fastBreathing contraindication blocks fast exercises
- [ ] overstimulated baseline shows only trauma-safe
- [ ] negative feedback sets adaptive flags
- [ ] early exit sets reduceIntensity flag

### Performance
- [ ] App launches in < 3 seconds
- [ ] Session screen is responsive
- [ ] No memory leaks
- [ ] Battery usage is reasonable

### Accessibility
- [ ] Contrast ratios meet WCAG AA
- [ ] Text is readable at all sizes
- [ ] Touch targets are minimum 44x44

---

## TestFlight Submission

### Build
- [ ] Version number set (1.0.0)
- [ ] Build number incremented
- [ ] Release configuration
- [ ] No debug symbols

### Upload
- [ ] Archive created
- [ ] Uploaded to App Store Connect
- [ ] Processing complete
- [ ] No validation errors

### TestFlight
- [ ] Internal testing group created
- [ ] Testers added
- [ ] Build distributed
- [ ] Testers notified

---

## App Store Submission

### App Information
- [ ] Name: ANDAS
- [ ] Subtitle: Trygg breathwork för riktiga liv
- [ ] Category: Health & Fitness
- [ ] Secondary Category: Lifestyle

### Pricing
- [ ] Free with in-app purchases (if applicable)
- [ ] Or: Paid app

### App Review Information
- [ ] Contact information
- [ ] Demo account (if needed)
- [ ] Notes for reviewer

### Notes for Reviewer

```
ANDAS is a trauma-informed breathwork app with safety as its core principle.

Key features for review:
1. Safety engine that adapts exercises based on user state
2. Contraindication checking (breathHolds, fastBreathing)
3. Integration phase after each session
4. No gamification or engagement tricks

Test account: Not needed

Special considerations:
- The app may say "no" to certain exercises based on user input - this is intentional safety behavior
- All data stays local on device
- No external analytics or tracking
```

---

## Post-Launch

### Monitoring
- [ ] Crash reporting enabled
- [ ] Analytics reviewed weekly
- [ ] User feedback collected
- [ ] App Store reviews monitored

### Iteration
- [ ] v1.1 planned
- [ ] Bug fixes prioritized
- [ ] Feature requests evaluated

---

## Emergency Contacts

- Technical lead: [email]
- Product lead: [email]
- Legal: [email]

---

**Version:** 1.0.0  
**Date:** 2026-02-03  
**Status:** READY FOR TESTFLIGHT
