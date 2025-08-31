# Project JSON Format

This document describes the complete JSON structure used for Zine Maker projects when they are exported/imported.

## Overview

Zine Maker projects are stored as JSON objects containing:
- Project metadata (name, dates, author info)
- Template configuration (format, layout, page positions)
- Page content (text, images, shapes, drawings)
- Asset references (for uploaded images)

## Complete Example

Below is a full example of the OPSEC Field Guide project JSON structure:

```json
{
  "project": {
    "id": "sample-opsec-1756385738568",
    "name": "OPSEC Field Guide",
    "template": {
      "id": "quarter-fold-letter",
      "name": "Quarter Fold Zine (Letter)",
      "format": "quarter-fold",
      "pageSize": "letter",
      "orientation": "landscape",
      "pageCount": 8,
      "description": "Classic 8-page zine made from a single letter-size sheet",
      "foldInstructions": "Fold in half hamburger-style, then in half again. Unfold once, cut the center slit, then fold into a booklet.",
      "printLayout": {
        "sheetWidth": 792,
        "sheetHeight": 612,
        "pagePositions": [
          {
            "pageNumber": 4,
            "x": 0,
            "y": 0,
            "width": 198,
            "height": 306,
            "rotation": 180,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 3,
            "x": 198,
            "y": 0,
            "width": 198,
            "height": 306,
            "rotation": 180,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 2,
            "x": 396,
            "y": 0,
            "width": 198,
            "height": 306,
            "rotation": 180,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 1,
            "x": 594,
            "y": 0,
            "width": 198,
            "height": 306,
            "rotation": 180,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 5,
            "x": 0,
            "y": 306,
            "width": 198,
            "height": 306,
            "rotation": 0,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 6,
            "x": 198,
            "y": 306,
            "width": 198,
            "height": 306,
            "rotation": 0,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 7,
            "x": 396,
            "y": 306,
            "width": 198,
            "height": 306,
            "rotation": 0,
            "isFlipped": false,
            "side": "front"
          },
          {
            "pageNumber": 8,
            "x": 594,
            "y": 306,
            "width": 198,
            "height": 306,
            "rotation": 0,
            "isFlipped": false,
            "side": "front"
          }
        ]
      },
      "pageCanvas": {
        "width": 198,
        "height": 306
      }
    },
    "pages": [
      {
        "id": "opsec-p1",
        "pageNumber": 1,
        "title": "Front Cover",
        "backgroundColor": "#ffffff",
        "content": [
          {
            "id": "p1-h",
            "type": "text",
            "x": 10,
            "y": 12,
            "width": 178,
            "height": 32,
            "rotation": 0,
            "zIndex": 1756385738568,
            "properties": {
              "text": "OPSEC Field Guide",
              "fontSize": 20,
              "fontFamily": "Arial",
              "fontWeight": "bold",
              "fontStyle": "normal",
              "color": "#10B981",
              "textAlign": "left",
              "lineHeight": 1.25,
              "textDecoration": "none",
              "padding": 0
            }
          },
          {
            "id": "p1-s",
            "type": "text",
            "x": 10,
            "y": 40,
            "width": 178,
            "height": 22,
            "rotation": 0,
            "zIndex": 1756385738568,
            "properties": {
              "text": "Pocket zine for activists & organizers",
              "fontSize": 13,
              "fontFamily": "Arial",
              "fontWeight": "normal",
              "fontStyle": "normal",
              "color": "#111111",
              "textAlign": "left",
              "lineHeight": 1.2,
              "textDecoration": "none",
              "padding": 0
            }
          },
          {
            "id": "p1-i",
            "type": "image",
            "x": 44,
            "y": 66,
            "width": 110,
            "height": 80,
            "rotation": 0,
            "zIndex": 1756385738568,
            "properties": {
              "src": "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22110%22%20height%3D%22100%22%20viewBox%3D%220%200%20110%20100%22%3E%3Cpath%20d%3D%22M55%2010l34%2012v26c0%2022-15%2036-34%2042-19-6-34-20-34-42V22l34-12z%22%20fill%3D%22none%22%20stroke%3D%22%23111%22%20stroke-width%3D%223%22%2F%3E%3C%2Fsvg%3E",
              "alt": "Shield icon",
              "opacity": 1
            }
          },
          {
            "id": "p1-f",
            "type": "text",
            "x": 10,
            "y": 270,
            "width": 178,
            "height": 26,
            "rotation": 0,
            "zIndex": 1756385738568,
            "properties": {
              "text": "Version 1.0 · Copy, remix, share",
              "fontSize": 12,
              "fontFamily": "Arial",
              "fontWeight": "normal",
              "fontStyle": "normal",
              "color": "#111111",
              "textAlign": "left",
              "lineHeight": 1.2,
              "textDecoration": "none",
              "padding": 0
            }
          }
        ]
      }
    ],
    "createdAt": "2025-08-28T12:55:38.568Z",
    "modifiedAt": "2025-08-28T12:55:38.568Z",
    "metadata": {
      "author": "Sample",
      "description": "Pocket-size digital safety guide for activists & organizers",
      "tags": ["sample", "security", "opsec"]
    }
  },
  "assets": []
}
```

## Structure Breakdown

### Project Root
- `project` - Main project object
- `assets` - Array of uploaded image files (base64 encoded)

### Project Object
- `id` - Unique project identifier
- `name` - Project display name
- `template` - Template configuration object
- `pages` - Array of page objects
- `createdAt` - ISO timestamp of creation
- `modifiedAt` - ISO timestamp of last modification
- `metadata` - Project metadata object

### Template Object
- `id` - Template identifier
- `name` - Template display name
- `format` - Zine format (quarter-fold, half-fold, booklet, etc.)
- `pageSize` - Paper size (letter, a4, legal, tabloid)
- `orientation` - Page orientation (portrait, landscape)
- `pageCount` - Number of pages in template
- `description` - Template description
- `foldInstructions` - How to fold the printed zine
- `printLayout` - Print layout configuration
- `pageCanvas` - Canvas dimensions for editing

### Print Layout Object
- `sheetWidth` - Width of print sheet in points
- `sheetHeight` - Height of print sheet in points
- `pagePositions` - Array of page position objects

### Page Position Object
- `pageNumber` - Page number (1-based)
- `x`, `y` - Position on print sheet
- `width`, `height` - Dimensions on print sheet
- `rotation` - Rotation angle in degrees
- `isFlipped` - Whether page is flipped horizontally
- `side` - Print side (front/back)

### Page Object
- `id` - Unique page identifier
- `pageNumber` - Page number (1-based)
- `title` - Page title
- `backgroundColor` - Background color (hex)
- `content` - Array of content objects

### Content Object
Content objects represent elements on the page (text, images, shapes, drawings):

#### Common Properties
- `id` - Unique content identifier
- `type` - Content type (text, image, shape, drawing)
- `x`, `y` - Position on page
- `width`, `height` - Dimensions
- `rotation` - Rotation angle in degrees
- `zIndex` - Stacking order
- `properties` - Type-specific properties object

#### Text Properties
- `text` - Text content
- `fontSize` - Font size in pixels
- `fontFamily` - Font family name
- `fontWeight` - Font weight (normal, bold)
- `fontStyle` - Font style (normal, italic)
- `color` - Text color (hex)
- `textAlign` - Text alignment (left, center, right, justify)
- `lineHeight` - Line height multiplier
- `textDecoration` - Text decoration (none, underline, line-through)
- `padding` - Text padding in pixels

#### Image Properties
- `src` - Image source (data URL or asset reference)
- `alt` - Alt text for accessibility
- `opacity` - Opacity (0-1)
- `assetId` - Reference to uploaded asset (optional)

#### Shape Properties
- `shapeType` - Shape type (rectangle, circle, line, triangle)
- `fill` - Fill color (hex)
- `stroke` - Stroke color (hex)
- `strokeWidth` - Stroke width in pixels
- `opacity` - Opacity (0-1)
- `cornerRadius` - Corner radius for rectangles (optional)

#### Drawing Properties
- `paths` - Array of drawing path objects
- `strokeColor` - Stroke color (hex)
- `strokeWidth` - Stroke width in pixels
- `opacity` - Opacity (0-1)
- `lineCap` - Line cap style (butt, round, square)
- `lineJoin` - Line join style (miter, round, bevel)
- `smoothing` - Whether to apply smoothing

### Assets Array
Contains uploaded image files as objects with:
- `id` - Asset identifier
- `filename` - Original filename
- `data` - Base64 encoded file data
- `type` - MIME type

## Usage

This JSON format is used for:
- **Project export/import** - Save and load complete projects
- **Project backup** - Create portable backups of all projects
- **Template creation** - Define new zine templates
- **API integration** - Programmatic project manipulation

## Validation

Projects are validated on import to ensure:
- Required fields are present
- Data types match expected formats
- References between objects are valid
- Asset references can be resolved
