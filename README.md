# Zine Maker

A professional zine design tool built with Vue 3, Vite, and PixiJS 8. Create beautiful zines that can be printed and folded into booklets.

## Features

- **Professional Design Tools**: Image upload, text editing, drawing, and shape creation
- **Zine Layout Support**: 8-page zine layout with proper page mapping
- **Real-time Canvas**: PixiJS-powered canvas with smooth performance
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark themes with easy customization
- **Export Options**: PNG, JPEG, and PDF export with print-ready output
- **Keyboard Shortcuts**: Professional-grade shortcuts for power users

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Graphics Engine**: PixiJS 8
- **State Management**: Pinia
- **Styling**: CSS Custom Properties with utility classes
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zine-maker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating a Zine

1. **Choose a Tool**: Select from the toolbar (Select, Image, Text, Draw, Shape, Zoom)
2. **Add Content**: Click on the canvas to add content
3. **Customize**: Use the sidebar to adjust properties
4. **Arrange**: Drag and drop content to position it correctly
5. **Export**: Use the export options to generate a print-ready file

### Keyboard Shortcuts

- `V` - Select Tool
- `I` - Image Tool  
- `T` - Text Tool
- `P` - Draw Tool
- `S` - Shape Tool
- `Z` - Zoom Tool
- `Ctrl+N` - New Project
- `Ctrl+S` - Save Project
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+A` - Select All
- `Delete` - Delete Selected

### Zine Layout

The tool creates 8-page zines with the following layout:

```
┌─────────┬─────────┐
│    1    │  Front  │
├─────────┼─────────┤
│    2    │   Back  │
├─────────┼─────────┤
│    3    │    6    │
├─────────┼─────────┤
│    4    │    5    │
└─────────┴─────────┘
```

When printed and folded, this creates a proper zine booklet.

## Project Structure

```
src/
├── components/          # Vue components
│   ├── AppHeader.vue   # Application header
│   ├── AppSidebar.vue  # Settings sidebar
│   ├── AppToolbar.vue  # Tool toolbar
│   ├── AppCanvas.vue   # Main canvas component
│   └── WelcomeModal.vue # Welcome modal
├── stores/             # Pinia stores
│   ├── project.ts      # Project state management
│   ├── ui.ts          # UI state management
│   └── tools.ts       # Tools state management
├── styles/             # CSS styles
│   ├── variables.css   # Design system variables
│   ├── base.css       # Base styles
│   ├── components.css # Component styles
│   └── main.css       # Main style imports
├── types/              # TypeScript types
│   └── index.ts       # Type definitions
├── App.vue            # Main app component
└── main.ts            # App entry point
```

## Architecture

### Component Design

- **Modular Components**: Each component has a single responsibility
- **Reusable**: Components can be easily used in other projects
- **Props Interface**: Clear props and events for component communication
- **Scoped Styles**: Component-specific styles that don't leak

### State Management

- **Pinia Stores**: Centralized state management with TypeScript
- **Separation of Concerns**: Different stores for different domains
- **Reactive**: Automatic reactivity with Vue 3
- **Persistent**: User preferences saved to localStorage

### Styling System

- **CSS Custom Properties**: Centralized design tokens
- **Utility Classes**: Reusable utility classes for common patterns
- **Theme Support**: Easy theme switching and customization
- **Responsive**: Mobile-first responsive design

## Customization

### Themes

The application supports light and dark themes. To customize:

1. Edit `src/styles/variables.css`
2. Modify the CSS custom properties
3. Add new theme variants as needed

### Adding New Tools

1. Add tool definition to `src/stores/tools.ts`
2. Create tool component if needed
3. Add tool logic to `src/components/AppCanvas.vue`
4. Update toolbar in `src/components/AppToolbar.vue`

### Styling

The design system uses CSS custom properties for easy theming:

```css
:root {
  --color-primary: #2563eb;
  --color-bg-primary: #ffffff;
  --spacing-md: 1rem;
  /* ... more variables */
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Vue 3](https://vuejs.org/)
- Graphics powered by [PixiJS](https://pixijs.com/)
- Icons and design inspiration from various sources
