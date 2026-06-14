# 🔍 Kyō-To Sushi Catania — Full Website Audit & Improvement Plan

A comprehensive, honest analysis of your current website architecture, code quality, design, UX, performance, SEO, and security — with a proposed restructuring plan.

---

## Completed Security Fixes ✅

### 1. **SECURITY: Secure Firestore Rules (P0)**
- **Status:** Done ✅
- **Details:** Replaced wide-open rules in [firestore.rules](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/firestore.rules) with collection-level access controls:
  - Public read-only for public assets (`menuItems`, `menuCategories`, `heroSlides`, `promotions`, `galleryItems`).
  - Create-only (write-only, no read) for public submissions of reservations.
  - Full authenticated read/write access to administrative collections like `adminUsers` and for managing reservations.

### 2. **SECURITY: Firebase Authentication & User Management (P0)**
- **Status:** Done ✅
- **Details:** Integrated Firebase Authentication and user registry:
  - Replaced client-side hardcoded credentials in [useAuth.js](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/src/hooks/useAuth.js) and enabled proper email/password login.
  - Added a new **Admin Users** tab to the Admin dashboard panel.
  - Implemented secure user creation (email/password/display name) using a secondary Firebase App instance (preventing the logged-in admin from being signed out).
  - Implemented access revocation/deletion of admin users.
  - Added a self-bootstrapping fallback login check that is active **only** while the Firestore `adminUsers` collection is empty. The moment the first real admin user logs in and registers, the fallback is permanently and securely disabled.

---

## Remaining Tasks for Tomorrow 📅

### 3. **CODE: Split `useFirestore.js` (68KB)**
> [!WARNING]
> [useFirestore.js](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/src/hooks/useFirestore.js) contains ~2,300 lines of hardcoded fallback data mixed with actual hooks. This inflates the JavaScript bundle size.
>
> **Proposed Fix:** Move fallback data into a separate file (`src/data/fallbackData.js`) or remove it entirely now that Firebase is configured.

### 4. **CODE: Split `Admin.jsx` Monolith (77KB)**
> [!WARNING]
> [Admin.jsx](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/src/pages/Admin.jsx) is 1,800+ lines managing reservations, menu items, hero slides, gallery, promotions, and now users.
>
> **Proposed Fix:** Split it into subcomponents under a new `src/components/admin/` directory.

### 5. **FOOTER: Remove Admin Link from Footer**
In [Footer.jsx](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/src/components/layout/Footer.jsx#L10), the Quick Links list contains a direct link to the Admin panel. It should be removed for security through obscurity.

### 6. **FOOTER: Real GDPR Privacy Policy Page**
The footer links for Privacy and Terms currently point to `/about` and `/contact`. Italian/EU restaurants collecting customer reservations must have a legitimate Privacy Policy (GDPR) page.

### 7. **UX: Social Media Links are Placeholders**
Social media icons in the navbar and footer point to generic `instagram.com` and `facebook.com`. They should link to actual restaurant accounts.

### 8. **UX: Send Email Confirmations for Reservations**
Customers currently submit reservations but receive no email confirmation.
> **Proposed Fix:** Set up a Firebase Cloud Function in `functions/src/index.ts` to trigger on reservation creation and send email notifications.

### 9. **UX: Time Slot Validation**
The reservation form does not restrict the time. Customers can book reservations when the restaurant is closed.
> **Proposed Fix:** Add time-range restrictions to the time picker in [Contact.jsx](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/src/pages/Contact.jsx).

### 10. **UX: Duplicate Booking Prevention**
Add frontend/backend checks to prevent a single client submitting multiple identical reservations for the same time slot.

### 11. **PERFORMANCE: Image Optimization Pipeline**
Add `srcset` attributes and specific height/width dimensions on page images to improve Core Web Vitals (minimize Cumulative Layout Shift).

### 12. **SEO: `<section>` Used as Page Root Instead of `<main>`**
Ensure Menu page uses proper `<main>` wrappers instead of a raw `<section>` to maintain semantic hierarchy.

### 13. **SEO: Italian Localization**
The restaurant is in Italy but the site content is solely in English (except for the Allergens modal). Integrate proper localization (i18n).

### 14. **SEO: Branded 404 Page**
[404.html](file:///c:/Users/Ric%20Pc/OneDrive/Documents/Webapps/Kyoto/public/404.html) is the default Firebase Hosting landing page. Build a custom branded 404 page.

### 15. **UX: Horizontal Scroll for Menu Categories on Mobile**
The menu categories list wraps onto multiple rows on small screens. Implement a horizontal swipe/scroll layout instead.

### 16. **CODE: Reusable `<MenuCard>` Component**
Extract duplicate menu item card rendering between Menu page and modals into a clean component.

### 17. **DESIGN: Fix Storage Video Playback in Gallery**
Fix media caching issues in Chrome/Safari when playing Firebase Storage videos in the gallery.

### 18. **POLISH: Google Reviews API**
Replace static rating badge with live ratings fetched from Google Places.

### 19. **POLISH: Skeleton Screens**
Use shimmer placeholders instead of standard spinners when loading data.

### 20. **POLISH: WhatsApp Booking Shortcut**
Add a floating WhatsApp contact widget (very common in Italian business sites).

---

## Priority & Status Table

| Priority | Issue | Status |
|----------|-------|--------|
| 🔴 P0 | Firestore rules wide open | **Completed** ✅ |
| 🔴 P0 | Admin auth client-side only | **Completed** ✅ |
| 🔴 P0 | GDPR: customer data exposed | **Completed** ✅ |
| 🟡 P1 | Split `useFirestore.js` (68KB) | Pending |
| 🟡 P1 | Split `Admin.jsx` (77KB) | Pending |
| 🟡 P1 | Reservation email confirmation | Pending |
| 🟡 P1 | Time slot validation | Pending |
| 🟡 P1 | Fix broken video assets | Pending |
| 🟡 P1 | Remove Admin link from footer | Pending |
| 🟡 P2 | Branded 404 page | Pending |
| 🟡 P2 | Real social media links | Pending |
| 🟡 P2 | Cookie consent banner (GDPR) | Pending |
| 🟡 P2 | Mobile menu tabs UX | Pending |
| 🟢 P3 | Privacy Policy page | Pending |
| 🟢 P3 | Image optimization (srcset) | Pending |
| 🟢 P3 | Skeleton loading screens | Pending |
| 🟢 P3 | WhatsApp button | Pending |
| 🟢 P3 | Multilingual support | Pending |
| 🟢 P3 | Google Reviews API | Pending |
