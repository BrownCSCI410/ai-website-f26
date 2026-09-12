# Uploading lecture materials

Upload PDF files to this folder using one of these exact filename formats:

- `YYYY-MM-DD-notes.pdf`
- `YYYY-MM-DD-slides.pdf`

For example, the materials for the September 9, 2026 lecture would be:

- `2026-09-09-notes.pdf`
- `2026-09-09-slides.pdf` (only when that lecture has slides)

The lecture table finds the files automatically. Links appear at midnight Eastern
Time on the date in the filename, so no change to `content.js` is needed.

Notes PDFs normally appear in the Notes column; slides PDFs appear in Resources.
To move one link, open `src/lectureMaterials.js` and change that filename's value
in `fileColumns`:

```js
'2026-09-09-notes.pdf': 'resources',
```

Use `'notes'` to put it back in Notes. For a new file, add a line with its filename
only if you want a different column from the default.

Readings shown in Resources are also listed by lecture date in `readingsByDate`
in the same file. Change the text there to update a reading.

GitHub Pages is a static site. An uploaded file is included in the deployed site
even before its link appears, so this release timing hides the link but is not a
secure embargo for private material.
