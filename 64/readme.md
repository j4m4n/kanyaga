# Dunes - LOWREZ JAM 2025

A minimalist 3D exploration game built with Three.js, designed for the LOWREZ JAM 2025 (64x64 pixel resolution).

## 🎮 Game Overview

Dunes is a 64x64 pixel 3D exploration game where players navigate through a procedurally generated world, interact with houses, and play minigames. The game features a unique low-resolution aesthetic with 3D graphics rendered in a tiny canvas.

## 📁 Project Structure

### Root Files
- `index.html` - Main entry point with game initialization
- `favicon.ico` - Browser favicon
- `readme.md` - This documentation

### 🎨 Assets (`/assets/`)
Visual assets for the game:
- `bump.jpg` - Texture for terrain bumps
- `col.jpg` - Color texture mapping  
- `face.png` - Character face texture
- `leg-still3.png` - Character idle animation frame
- `leg-walk3.png` - Character walking animation frame
- `natron-bmp.png` - Normal map texture
- `natron-col.png` - Color variation texture

### 🎨 Stylesheets (`/css/`)
- `page.css` - Main styling with dark theme and pixel-perfect rendering
- `debug.css` - Debug UI styling for development

### 💻 JavaScript Code (`/js/`)

#### Core Classes (`/js/classes/`)
- **`Game.js`** (543 lines) - Main game engine class
  - Scene initialization and management
  - Player movement and controls
  - House and object placement
  - Minigame integration
  - 3D rendering with Three.js

- **`GoldSmashMinigame.js`** (130 lines) - Mini-game implementation
  - Gold sphere collection game
  - Particle explosion effects
  - Independent scene management

- **`CrappyObjectInstance.js`** - Object instance management for scene objects

#### Global Configuration (`/js/globals/`)
- **`CONTROLS.js`** - Input handling system
  - Keyboard controls (Arrow keys, Space)
  - Virtual joystick integration (nipplejs)
  - Touch/mobile support

- **`MODELS_CONFIG.js`** - 3D model definitions
  - House geometry and positioning
  - Door placement and scaling
  - Material assignments

#### Utilities (`/js/utils/`)
- **`math.js`** - Mathematical utility functions
  - Speed limiting for player movement
  - Vector calculations

- **`sceneLogger.js`** - Scene debugging and logging
- **`sceneObjectDebugger.js`** - Object inspection tools

#### External Libraries
- **`three.min.js`** - Three.js 3D graphics library
- **`nipplejs.js`** - Virtual joystick for mobile controls

## 🎯 Game Features

### Core Gameplay
- **64x64 Resolution**: Ultra-low resolution rendering for retro aesthetic
- **3D Exploration**: Navigate a 1024x1024 world map in 3D space
- **House Interaction**: Enter buildings to trigger minigames
- **Dual Control Schemes**: Keyboard and touch/mobile support

### Technical Features
- **Three.js Integration**: WebGL-based 3D rendering
- **Responsive Controls**: Smooth player movement with speed limiting
- **Modular Architecture**: Clean separation of concerns
- **Debug Tools**: Built-in debugging and scene inspection
- **Mobile Optimized**: Touch controls with virtual joystick

## 🎮 Controls

### Keyboard
- **Arrow Keys**: Move player
- **Space**: Action/Interact

### Touch/Mobile
- **Virtual Joystick**: Drag to move player
- **Touch**: Tap to interact

## 🔧 Technical Details

### Rendering
- **Resolution**: 64x64 pixels
- **Graphics**: WebGL via Three.js
- **Pixel Perfect**: Crisp-edges rendering
- **Performance**: Optimized for low resolution

### Architecture
- **Object-Oriented**: Class-based architecture
- **Modular**: Separated concerns and utilities
- **Configurable**: External configuration files
- **Extensible**: Easy to add new minigames and objects

## 🚀 Getting Started

1. Open `index.html` in a web browser
2. Use arrow keys or touch controls to move
3. Approach houses and interact to play minigames
4. Explore the 3D world within the 64x64 viewport

## 🎪 LOWREZ JAM 2025

This project was created for the LOWREZ JAM 2025, challenging developers to create games within a 64x64 pixel constraint while maintaining engaging gameplay and visual appeal.
