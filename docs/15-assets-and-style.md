# 15 - Assets and Visual Style

This document defines the aesthetic guidelines for the visual and sound assets of **Legacy's End**.

## 1. Visual Style: Pixel Art

The game uses a retro Pixel Art aesthetic to contrast with the modernity of its underlying technical architecture.

### 1.1 Sprite Specifications

- **Base Size**: 32x32 pixels.
- **Rendering**: `image-rendering: pixelated;` must be used in CSS to prevent smoothing in modern browsers.
- **Color Palette**: Use of limited palettes (e.g., DB32 or Lospec) is recommended to maintain consistency.
- **Animations**: Simple 4 to 8 frame cycles for walking and idle.

### 1.2 Scenarios and Backgrounds

- **Resolution**: Backgrounds must be optimized for scales proportional to the viewport.
- **Layers (Parallax)**: Multiple layers can be used to give depth to the scenario (e.g., background, decorative middle plane, game plane).
- **Corruption Contrast**:
  - **Corrupt Zones**: Desaturated colors, dark violets, acid greens, angular and "glitchy" shapes.
  - **Healed Zones**: Vibrant colors, organic shapes, warm lighting.

## 2. Sound Style (Audio)

Audio is fundamental to the narrative atmosphere and pedagogical feedback.

### 2.1 Atmospheric Music

- **Style**: Modern chiptune or ambient synths.
- **Dynamics**: Music should change subtly when the scenario transitions from "corrupt" to "healed".

### 2.2 Sound Effects (SFX)

- **Interaction**: Light sound when advancing slides.
- **Collection**: Triumphant (but short) sound when collecting a Reward.
- **Movement**: Subtle footsteps depending on the terrain.
- **Error/Warning**: System sound when an action is not possible.

### 2.3 Formats and Optimization

- **Formats**: `.ogg` for modern browsers, `.mp3` as fallback.
- **Loading**: Audio assets should be lazy-loaded per mission to avoid penalizing Hub startup.
