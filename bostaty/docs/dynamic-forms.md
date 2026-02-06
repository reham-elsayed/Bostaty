# Dynamic Form System Documentation

The Bostaty application features a metadata-driven dynamic form system that allows for rapid UI generation based on Zod schemas and field configurations.

## 🏗️ Core Components

- **`DynamicForm.tsx`**: The main engine that renders the form using `shadcn/ui` components.
- **`FormFieldConfig`**: The TypeScript interface defining how a field should behave.

## 🚀 How to Use

### 1. Define your Schema (Zod)
Define the shape of your data and validation rules.

```typescript
const profileSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['Dev', 'Design']),
});
```

### 2. Define your Fields
Create an array of `FormFieldConfig` objects.

```typescript
const fields: FormFieldConfig[] = [
  { 
    name: "name", 
    label: "Full Name", 
    type: "text" 
  },
  { 
    name: "role", 
    label: "Job Role", 
    type: "select", 
    options: [
      { label: "Developer", value: "Dev" },
      { label: "Designer", value: "Design" }
    ] 
  },
];
```

### 3. Use the Component

```tsx
<DynamicForm
  schema={profileSchema}
  fields={fields}
  onSubmit={async (data) => {
    // Handle submission (e.g., call a Server Action)
    console.log(data);
  }}
                                                                                                                                                                                           
  buttonText="Save Profile"
  className="grid grid-cols-2 gap-4" // Optional: Configurable layout
/>
```

## 🎨 Supported Field Types

| Type | Description |
|------|-------------|
| `text` | Standard text input. Supports `inputType` (e.g., "password", "email"). |
| `number` | Numeric input. Coerces value to number. |
| `textarea` | Multi-line text area. |
| `select` | Dropdown menu. Requires `options`. |
| `checkbox` | Boolean toggle. |
| `color` | Color picker input. |
| `multi-select` | Multi-select input for arrays (e.g., permissions). |

## ✨ Built-in Features
- **Validation**: Automatically integrates with Zod for error messaging.
- **Toasts**: Uses `sonner` for loading, success, and error feedback during submission.
- **Loading State**: Disables the submit button while `onSubmit` is processing.
- **Dynamic Configuration**: Schemas and fields can be generated at runtime (e.g., `getInviteFormConfig`) to adapt to tenant settings or enabled modules.
