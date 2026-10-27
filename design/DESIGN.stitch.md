---
name: Overload Command Interface
colors:
  surface: '#071420'
  surface-dim: '#071420'
  surface-bright: '#2e3a47'
  surface-container-lowest: '#030f1b'
  surface-container-low: '#101d29'
  surface-container: '#14212d'
  surface-container-high: '#1e2b38'
  surface-container-highest: '#293643'
  on-surface: '#d6e4f5'
  on-surface-variant: '#d1c5ad'
  inverse-surface: '#d6e4f5'
  inverse-on-surface: '#25323e'
  outline: '#9a907a'
  outline-variant: '#4d4634'
  surface-tint: '#edc22e'
  primary: '#fff2d7'
  on-primary: '#3d2f00'
  primary-container: '#ffd23f'
  on-primary-container: '#725a00'
  inverse-primary: '#745c00'
  secondary: '#3fe0c5'
  on-secondary: '#00382f'
  secondary-container: '#00c4aa'
  on-secondary-container: '#004b40'
  tertiary: '#fff0ef'
  on-tertiary: '#680016'
  tertiary-container: '#ffcaca'
  on-tertiary-container: '#b61935'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe089'
  primary-fixed-dim: '#edc22e'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#61fade'
  secondary-fixed-dim: '#3bddc2'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005045'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b4'
  on-tertiary-fixed: '#40000a'
  on-tertiary-fixed-variant: '#920023'
  background: '#071420'
  on-background: '#d6e4f5'
  surface-variant: '#293643'
typography:
  display-hero:
    fontFamily: Rubik
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: 0.04em
  display-hero-mobile:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Rubik
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 24px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.02em
  title-sm:
    fontFamily: Rubik
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Rubik
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Rubik
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Rubik
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  label-lg:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Rubik
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system delivers a tactile, high-energy crisis management interface rooted in comic-book industrial futurism and retro CRT monitoring aesthetics. Designed for high-stress dispatch gameplay, the UI prioritizes instantaneous legibility, chunky tactile affordance, and clear functional hierarchy.

### Core Visual Principles
- **Comic-Tech Chunky Brutalism:** Structural containment relies on authoritative 3px ink-stroke contours (`#0B1220`) coupled with unblurred, hard-offset drop shadows (`4px 4px 0 #0B1220`). Elements project tactile weight and physical mechanical resistance.
- **CRT Command Terminal Layering:** Deep industrial blues and slates form a non-distracting canvas over which phosphor-inspired terminal accents vibrate. Subtle pixel/halftone scanline motifs frame alert windows without degrading operational readability.
- **Physical Feedback Mechanics:** Interactive controls utilize exaggerated 3D push-down physics with 6px hard bottom anchor offsets that compress on interaction, mirroring arcade control panels and mission-critical emergency switches.
- **Language & Voice (Turkish):** Crisp, imperative, military-technical dispatch tone ("SEVK ET", "KRİTİK HATA", "SİSTEM AŞIRI YÜKLENDİ", "AJAN ATANDI").

## Colors

The palette balances tactical dark-mode operations with visceral, high-contrast comic book accents.

### Operational Foundations
- **Base Canvas (`#0F1C28` to `#132636`):** The lowest monitoring substrate; provides sustained visual comfort under intensive dispatch conditions.
- **Surface Tiers (`#1A3247` to `#22405A`):** Workstation deck panels, telemetry HUD containers, and map overlays.
- **Ink Contours & Hard Shadows (`#0B1220`):** Heavy dark ink outlines applied across all interactive modules, dividers, and offset projections.
- **Display Typography Text (`#F5ECD7`):** Warm CRT amber-cream text delivering high contrast without the eye strain of pure `#FFFFFF`.
- **Muted Telemetry (`#9DB4C6`):** Secondary metrics, unit status subtitles, and background coordinate feeds.

### Command Accents
- **Primary Action (`#FFD23F`):** Sun yellow for high-priority dispatch directives, tactical confirm prompts, and pending calls.
- **Cyber Line (`#3FE0C5`):** Signal integrity, successful network routes, and IT patch conduits.
- **Crisis Red (`#FF5263`):** Uncontained hospital crises, critical server failures, and triage alarms.
- **Hazard Warning (`#FF8A3D`):** Bottlenecks, escalating agent fatigue, and load thresholds.
- **Terminal Heartbeat (`#5FE39A`):** Optimal system telemetry, active units, and completed incidents.

### Dedicated Agent Identification Accents
- **Claude:** Rust Terracotta (`#D97757`)
- **Gemini:** Celestial Violet (`#8F7CF6`)
- **GPT:** Synthetic Emerald (`#10A37F`)
- **Llama:** Sub-Zero Cobalt (`#3B82F6`)
- **Mistral:** Solar Amber (`#FFAF00`)

## Typography

Typography balances punchy arcade energy with clinical HUD density. 

### Implementation Guidelines
- **Header Execution:** Headlines and display labels use heavy uppercase formatting with tightened line-heights and slight letter-spacing to emphasize authority and urgent delivery.
- **HUD Numbers & Readouts:** Numbers, status coordinates, and countdown timers must leverage tabular numeral spacing to prevent layout jitter during active simulations.
- **Turkish Diacritics:** Ensure character sets include complete coverage for Turkish glyphs (`Ğ`, `Ü`, `Ş`, `İ`, `Ö`, `Ç`, `ı`), preserving weight parity across display and HUD elements.

## Layout & Spacing

The game interface operates as a structured tactical dashboard: a dynamic hospital sector map surrounded by modular, hard-edged dispatch decks.

### Layout Mechanics
- **Mobile First-Response Mode:** Vertical layout stacked into three primary operational blocks:
  1. Top Telemetry Bar: System load, time-to-overload countdown, resource nodes.
  2. Main Hospital Tactical Grid: Map viewport for sector node diagnostics and crisis outbreaks.
  3. Bottom Dispatch Deck: Swipeable or tray-based AI Agent roster with direct target-assign mechanics.
- **Desktop/Tablet Command Deck:** Map sits centrally with lateral dock panels: left for live crisis logs and alerts; right for AI agent performance, compute throttle, and queue management.
- **Grid Structure:** Fluid 12-column setup for desktop configurations dropping to a single-column modular stack on mobile viewports.
- **Safe Zone Density:** Tactical borders and interactive edges enforce a minimum 48px target zone for finger tap reliability under rapid gameplay.

## Elevation & Depth

Visual hierarchy does not use soft blur elevations or realistic illumination. Depth is strictly physical, architectural, and hard-edged.

### Depth System Hierarchy
- **Level 0 (Map & Canvas Floor):** `#0F1C28` background with an optional faint CRT scanline overlay (1px line every 4px at 4% opacity).
- **Level 1 (Dock & Deck Surfaces):** `#1A3247` solid surface, bordered by a 3px solid `#0B1220` boundary. No bottom offset shadow; elements sit embedded in the master terminal.
- **Level 2 (Tactile Cards & Trays):** `#22405A` floating interactive surfaces. Styled with a 3px solid `#0B1220` border and a hard offset shadow: `4px 4px 0 #0B1220`.
- **Level 3 (Interactive Action Controls):** 3D mechanical keys. Surfaces feature a 3px solid `#0B1220` stroke and a resting vertical extrusion: `0 6px 0 #0B1220`. On active tap/press, the element translates down (`transform: translateY(4px)`) while the bottom extrusion reduces to `0 2px 0 #0B1220`, delivering tangible mechanical feedback.
- **Level 4 (Critical Emergency Modals):** Overload state overlays with `6px 6px 0 #0B1220` hard offsets, framed by flashing red alert borders (`#FF5263`).

## Shapes

The design system employs chunky, high-radius contours to establish an approachable arcade feel while retaining structural rigor.

### Geometry Specifications
- **Standard UI Panels & Modules:** 12px to 14px outer corner radius (`rounded-lg`), pairing with the 3px ink stroke to create cartoonish solidity.
- **Pills & Status Badges:** Fully rounded capsule contours for agent state markers, tier tags, and alert counters.
- **Cutouts & Notches:** Tactical cards may utilize 45-degree chamfered top-right corners for diagnostic serial headers and sector codes.

## Components

### Buttons & Dispatch Triggers
- **Primary Tactical Trigger ("SEVK ET" / "MÜDAHALE ET"):** `#FFD23F` surface with `#0B1220` uppercase label. Thick 3px border `#0B1220`, 6px bottom drop-offset. On press, translate downward by 4px with bottom shadow reduced to 2px.
- **Agent Action Buttons:** Themed directly with agent accent fills (e.g., Claude `#D97757`, Gemini `#8F7CF6`, GPT `#10A37F`) with cream `#F5ECD7` typography.
- **Destructive/Abort Controls:** `#FF5263` solid background with hard ink drop shadow.

### Crisis Cards (Hospital Node Alerts)
- **Container:** Dark slate `#22405A` background, 3px `#0B1220` border, `4px 4px 0 #0B1220` shadow, 14px corner radius.
- **Header:** Pill badge indicating Crisis Severity ("SEVİYE 3", "KOD KIRMIZI").
- **Body:** Crisis description in `#F5ECD7`, countdown timer in high-contrast `#FFD23F` tabular numbers.
- **Affiliation Track:** Progress bar indicating agent resolution speed with a 3px outline and segmented block fills.

### Agent Roster Chips & Selector Tiles
- **Structure:** Chunky vertical tiles showcasing agent avatar, operational status ("HAZIR", "MEŞGUL", "SOĞUMADA"), and current throughput.
- **Selection State:** Active agent card expands slightly with a vibrant cyber-teal (`#3FE0C5`) outer glow ring seated inside a hard 3px ink border.

### Telemetry Input Fields & Search Bars
- **Surface:** Deep inset `#0F1C28` with an internal 2px `#0B1220` bevel line. Text rendered in `#F5ECD7`.
- **Focus State:** Stroke transitions to `#3FE0C5` with instant hard shadow `3px 3px 0 #0B1220`.

### Overload & Health Meters (Gauges)
- **Style:** Segmented arcade health blocks enclosed within a continuous 3px solid dark contour.
- **Color Thresholds:** 0-60% normal (`#5FE39A`), 61-85% warning (`#FF8A3D`), 86-100% overload (`#FF5263`).