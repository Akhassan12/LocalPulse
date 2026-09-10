# LocalPulse Design System: Nocturne Expedition & Terravoyage

## 1. Creative North Star & Brand Ethos
**"The Cultural Cartographer & Restorative Expedition"**
LocalPulse balances **Utilitarian Field Instrumentality** with **Warm Tactile Terracotta**. It is tailored for travelers, cultural curators, and curious explorers discovering authentic local heritage, crafts, and community rituals. 

The aesthetic philosophy fuses:
1. **Curated Earth Surfaces**: Warm canvas base (`#FBF9F5`) and terracotta accents (`#E05A38`) inspired by kiln-fired clay, desert fortresses, and handloom block prints.
2. **Precision Navigation Instruments**: Telemetry pings, monospace coordinates, circular fit dials, and live travel constraints.
3. **Weightless Depth**: Diffused atmospheric shadows (`box-shadow: 0 12px 36px -8px rgba(26,26,30,0.06)`), 20px frosted backdrop blurs, and soft pill geometry.

---

## 2. Color Palette & Material Surfaces
- **Canvas & Base**:
  - `canvas`: `#FBF9F5` (Warm Alabaster Canvas)
  - `canvas-dim`: `#F5F2EB` (Warm Sand Surface)
  - `canvas-well`: `#EDE8DF` (Trough / Well Backdrops)
  - `card-bg`: `#FFFFFF` (Pure White Card Container)
  - `card-border`: `#E6E0D6` (Stone Hairline Border)
- **Primary Accent (Terracotta Sunset)**:
  - `terra-primary`: `#E05A38` (Primary Actions, Fit Highlights, Waypoints)
  - `terra-hover`: `#E86B4B` (Hover States & Glows)
  - `terra-light`: `#FDEEE9` (Subtle Pills, Explanations & Badges)
  - `terra-glow`: `rgba(224, 90, 56, 0.20)`
- **Secondary Accent (Forest Slate & Sage)**:
  - `forest-primary`: `#3B5249` (Itinerary Badges, Conservation Counters)
  - `forest-light`: `#EDF2EF` (Secondary Pills & Active Tags)
  - `sage-accent`: `#6B8E7B` (Eco Radiuses & Safe Margins)
- **Typography & Ink**:
  - `ink-heading`: `#1A1A1E` (High-contrast Titles)
  - `ink-body`: `#36363D` (Readable Editorial Body)
  - `ink-muted`: `#75747A` (Secondary Metadata)
  - `ink-ghost`: `#9E9DA3` (Input Placeholders & Icons)

---

## 3. Typography & Hierarchy
- **Editorial Display**: `Plus Jakarta Sans` / `Noto Serif`
  - Hero Display: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12]`
  - Section Headings: `text-3xl md:text-4xl font-bold text-[#1A1A1E]`
  - Card Titles: `text-base font-bold text-[#1A1A1E] leading-snug`
- **Modern Humanist Body**: `Plus Jakarta Sans`
  - Body Regular: `15px / 24px line-height, text-[#36363D]`
  - Body Small: `13px / 20px line-height, text-[#75747A]`
- **Telemetry & Metadata**: `Space Grotesk`
  - Telemetry Data: `14px / 18px line-height, font-medium, tabular-nums`
  - Label Caps: `11px / 14px line-height, 0.08em tracking, uppercase font-semibold`

---

## 4. Shapes & Geometry
- **Buttons & Pills**: `rounded-full` for all action CTAs, tags, and status chips to maintain fluid, friendly ergonomics.
- **Cards & Bento Units**: `rounded-2xl` (16px–24px) with subtle `1px solid #E6E0D6` borders and warm diffused elevation.
- **Gauges & Pin Icons**: Pure circles (`rounded-full`) with dead-center aligned typography using SVG `dominant-baseline="central"` and `text-anchor="middle"`.
