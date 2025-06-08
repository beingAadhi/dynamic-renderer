# Dynamic HTML Renderer

A simple, extensible JavaScript project for dynamically rendering HTML forms based on a JSON configuration. Supports live editing, validation, and API payload preview.

## Features
- Render text, number, select, and radio fields from JSON config
- Live JSON editing with instant validation and error messages
- Extensible: add new field types easily in `src/app.js`

## JSON Configuration Example
```json
{
  "formAction": "https://api.example.com/submit",
  "fields": [
    { "label": "Name", "type": "text", "key": "name", "required": true },
    { "label": "Age", "type": "number", "key": "age" },
    { "label": "Gender", "type": "select", "key": "gender", "options": ["Male", "Female"] },
    { "label": "Subscription", "type": "radio", "key": "subscription", "options": ["Free", "Premium", "Enterprise"], "required": true }
  ]
}
```

## Extending Field Types
To add a new field type, edit `src/app.js` and add a new renderer to the `fieldRenderers` object:
```js
fieldRenderers.customType = (field) => {
  // return a DOM element for your custom field
};
```

## Validation
- JSON must be valid and contain a `fields` array.
- Each field must have `label`, `type`, and `key`.
- `select` and `radio` fields require an `options` array.
- `formAction` must be a valid URL.