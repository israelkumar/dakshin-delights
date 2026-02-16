#!/bin/bash
# Dark Theme Feature Test Suite
# Issue: #1 - Implement Dark Theme
# Date: 2026-02-16

echo "=========================================="
echo "DARK THEME FEATURE - TEST SUITE"
echo "Issue: #1 - Implement Dark Theme"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Test 1: ThemeToggle Component Exists
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 1] ThemeToggle Component Exists"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "components/ThemeToggle.tsx" ]; then
  echo "Status: ✓ PASS"
  echo "Result: ThemeToggle.tsx found in components/"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: ThemeToggle.tsx not found"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 2: ThemeToggle Imported in App.tsx
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 2] ThemeToggle Imported in App.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "import.*ThemeToggle" App.tsx; then
  echo "Status: ✓ PASS"
  echo "Result: ThemeToggle imported in App.tsx"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: ThemeToggle import not found in App.tsx"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 3: ThemeToggle Component Structure
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 3] ThemeToggle Component Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_usestate=$(grep "useState" components/ThemeToggle.tsx 2>/dev/null | grep "isDark" | wc -l)
has_useeffect=$(grep "useEffect" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_localstorage=$(grep "localStorage" components/ThemeToggle.tsx 2>/dev/null | wc -l)

if [ "$has_usestate" -gt 0 ] && [ "$has_useeffect" -gt 0 ] && [ "$has_localstorage" -gt 0 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Component has proper structure"
  echo "  - useState for theme state: Yes"
  echo "  - useEffect for DOM updates: Yes"
  echo "  - localStorage persistence: Yes"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Component structure incomplete"
  echo "  - useState: $has_usestate occurrences"
  echo "  - useEffect: $has_useeffect occurrences"
  echo "  - localStorage: $has_localstorage occurrences"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 4: Dark Mode Classes in Document
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 4] Dark Mode Classes Applied"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_dark_class=$(grep "classList.add.*dark" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_dark_remove=$(grep "classList.remove.*dark" components/ThemeToggle.tsx 2>/dev/null | wc -l)

if [ "$has_dark_class" -gt 0 ] && [ "$has_dark_remove" -gt 0 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Dark mode classes properly managed"
  echo "  - Adds 'dark' class: Yes"
  echo "  - Removes 'dark' class: Yes"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Dark mode class management incomplete"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 5: System Preference Detection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 5] System Preference Detection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -q "prefers-color-scheme" components/ThemeToggle.tsx; then
  echo "Status: ✓ PASS"
  echo "Result: System preference detection implemented"
  echo "  - Uses matchMedia('prefers-color-scheme: dark')"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ⚠ WARNING"
  echo "Result: System preference detection not found"
  echo "  - Component may not respect user's OS theme preference"
  WARN_COUNT=$((WARN_COUNT + 1))
fi
echo ""

# Test 6: Accessibility - ARIA Labels
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 6] Accessibility - ARIA Labels"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_aria_label=$(grep "aria-label" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_aria_hidden=$(grep "aria-hidden" components/ThemeToggle.tsx 2>/dev/null | wc -l)

if [ "$has_aria_label" -gt 0 ] && [ "$has_aria_hidden" -gt 0 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Proper accessibility attributes"
  echo "  - aria-label on button: Yes"
  echo "  - aria-hidden on icons: Yes"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Accessibility attributes incomplete"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 7: Dark Mode Styles in App Components
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 7] Dark Mode Styles Across Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
dark_count=$(grep -r "dark:" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)

if [ "$dark_count" -gt 20 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Dark mode styles applied across app"
  echo "  - Found $dark_count dark: class instances"
  PASS_COUNT=$((PASS_COUNT + 1))
elif [ "$dark_count" -gt 10 ]; then
  echo "Status: ⚠ WARNING"
  echo "Result: Some dark mode styles found"
  echo "  - Found $dark_count dark: class instances (expected > 20)"
  WARN_COUNT=$((WARN_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Insufficient dark mode styles"
  echo "  - Found only $dark_count dark: class instances"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 8: Dark Mode in Key Components
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 8] Dark Mode in Key Components"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_nav_dark=$(grep "dark:bg-" App.tsx 2>/dev/null | wc -l)
has_menu_dark=$(grep "dark:" pages/Menu.tsx 2>/dev/null | wc -l)
has_checkout_dark=$(grep "dark:" pages/Checkout.tsx 2>/dev/null | wc -l)

total_key_components=$((has_nav_dark + has_menu_dark + has_checkout_dark))

if [ "$total_key_components" -gt 5 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Key components have dark mode styles"
  echo "  - App.tsx (nav): $has_nav_dark instances"
  echo "  - Menu.tsx: $has_menu_dark instances"
  echo "  - Checkout.tsx: $has_checkout_dark instances"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Insufficient dark mode in key components"
  echo "  - Total dark: classes in key components: $total_key_components"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 9: Tailwind Dark Mode Configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 9] Tailwind Dark Mode Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "tailwind.config.js" ]; then
  if grep -q "darkMode.*:.*['\"]class['\"]" tailwind.config.js; then
    echo "Status: ✓ PASS"
    echo "Result: Tailwind dark mode configured (class strategy)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "Status: ⚠ WARNING"
    echo "Result: Tailwind config exists but dark mode strategy unclear"
    echo "  - Expected: darkMode: 'class'"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
else
  echo "Status: ✗ FAIL"
  echo "Result: tailwind.config.js not found"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 10: Toggle Button Placement
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 10] Theme Toggle Button Placement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
desktop_toggle=$(grep "<ThemeToggle />" App.tsx 2>/dev/null | wc -l)

if [ "$desktop_toggle" -ge 2 ]; then
  echo "Status: ✓ PASS"
  echo "Result: ThemeToggle placed in multiple locations"
  echo "  - Found $desktop_toggle <ThemeToggle /> instances"
  echo "  - Expected: Desktop nav + Mobile menu"
  PASS_COUNT=$((PASS_COUNT + 1))
elif [ "$desktop_toggle" -eq 1 ]; then
  echo "Status: ⚠ WARNING"
  echo "Result: ThemeToggle found but only in one location"
  echo "  - Consider adding to both desktop and mobile navigation"
  WARN_COUNT=$((WARN_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: ThemeToggle not used in App.tsx"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 11: Icon Toggle Logic
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 11] Icon Toggle Logic"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_light_icon=$(grep "light_mode" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_dark_icon=$(grep "dark_mode" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_conditional=$(grep "isDark.*?" components/ThemeToggle.tsx 2>/dev/null | wc -l)

if [ "$has_light_icon" -gt 0 ] && [ "$has_dark_icon" -gt 0 ] && [ "$has_conditional" -gt 0 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Icon toggle logic implemented"
  echo "  - Light mode icon: Yes"
  echo "  - Dark mode icon: Yes"
  echo "  - Conditional rendering: Yes"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: Icon toggle logic incomplete"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 12: localStorage Persistence
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[TEST 12] Theme Persistence (localStorage)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
has_getitem=$(grep "localStorage.getItem.*theme" components/ThemeToggle.tsx 2>/dev/null | wc -l)
has_setitem=$(grep "localStorage.setItem.*theme" components/ThemeToggle.tsx 2>/dev/null | wc -l)

if [ "$has_getitem" -gt 0 ] && [ "$has_setitem" -gt 0 ]; then
  echo "Status: ✓ PASS"
  echo "Result: Theme persistence implemented"
  echo "  - Reads from localStorage: Yes ($has_getitem times)"
  echo "  - Writes to localStorage: Yes ($has_setitem times)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "Status: ✗ FAIL"
  echo "Result: localStorage persistence incomplete"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Summary
echo "=========================================="
echo "DARK THEME TEST SUMMARY"
echo "=========================================="
echo "Total Tests: $((PASS_COUNT + FAIL_COUNT + WARN_COUNT))"
echo "✓ Passed: $PASS_COUNT"
echo "✗ Failed: $FAIL_COUNT"
echo "⚠ Warnings: $WARN_COUNT"
echo ""
echo "Test completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Overall Status
if [ $FAIL_COUNT -eq 0 ]; then
  if [ $WARN_COUNT -eq 0 ]; then
    echo "Overall Status: ✓ ALL TESTS PASSED"
    exit 0
  else
    echo "Overall Status: ✓ PASSED (with warnings)"
    exit 0
  fi
else
  echo "Overall Status: ✗ SOME TESTS FAILED"
  exit 1
fi
