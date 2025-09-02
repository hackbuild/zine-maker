# Samples: Adding and Managing Sample Zines

This app can ship with ready-made sample projects. Samples are plain JSON files discovered at runtime via a small manifest.

## Where samples live

- Folder: `public/samples-json/`
- Manifest: `public/samples-json/samples-manifest.json`

The manifest is a simple array of filenames:

```
[
  "Color_Play.json",
  "ICE_Know_Your_Rights.json",
  "Lock_It_Down.json",
  "OPSEC_Field_Guide.json",
  "Zines_Voices_from_the_Underground.json"
]
```

## Add a new sample

1) Create or export your zine JSON
- Build a zine on https://zeenster.com and choose “Download Project JSON”, or export from this app’s Projects modal.

2) Put the JSON into the samples folder
- Save the file into `public/samples-json/` (e.g., `My_New_Zine.json`).

3) Update the manifest
- Open `public/samples-json/samples-manifest.json` and add the filename:

```
[
  "My_New_Zine.json"
]
```

That’s it. The app will list your new sample in the Template Selector and in Projects → “Browse Sample Zines”, showing the project’s `name` and `metadata.description` from the JSON.

## JSON shape expected

The loader accepts either format:
- Wrapped: `{ "project": { ... }, "assets": [] }`
- Direct: `{ ...project }`

Key fields used for display:
- `project.name` → sample title
- `project.metadata.description` → sample description (fallback: “{pageCount} pages”)

## Notes

- No code changes are required; samples are fully data-driven via the manifest.
- Removing an entry from the manifest hides it from the UI.
- `installSamples()` can preload samples into IndexedDB on first run; it also reads the manifest.

