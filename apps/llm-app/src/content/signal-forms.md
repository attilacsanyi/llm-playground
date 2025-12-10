# Forms with signals

**IMPORTANT:** Signal Forms are experimental. The API may change in future releases. Avoid using experimental APIs in production applications without understanding the risks.

Signal Forms manage form state using Angular signals to provide automatic synchronization between your data model and the UI with Angular Signals.

This guide walks you through the core concepts to create forms with Signal Forms. Here's how it works:

## Creating your first form

### 1. Create a form model with signal()

Every form starts by creating a signal that holds your form's data model:

```typescript
interface LoginData {
  email: string;
  password: string;
}

const loginModel = signal<LoginData>({
  email: '',
  password: '',
});
```

### 2. Pass the form model to form() to create a FieldTree

Then, you pass your form model into the `form()` function to create a **field tree** - an object structure that mirrors your model's shape, allowing you to access fields with dot notation:

```typescript
const loginForm = form(loginModel);

// Access fields directly by property name
loginForm.email;
loginForm.password;
```

### 3. Bind HTML inputs with [field] directive

Next, you bind your HTML inputs to the form using the `[field]` directive, which creates two-way binding between them:

```html
<input
  type="email"
  [field]="loginForm.email"
/>
<input
  type="password"
  [field]="loginForm.password"
/>
```

As a result, user changes (such as typing in the field) automatically updates the form.

**NOTE:** The `[field]` directive also syncs field state for attributes like `required`, `disabled`, and `readonly` when appropriate.

### 4. Read field values with value()

You can access field state by calling the field as a function. This returns a `FieldState` object containing reactive signals for the field's value, validation status, and interaction state:

```typescript
loginForm.email(); // Returns FieldState with value(), valid(), touched(), etc.
```

To read the field's current value, access the `value()` signal:

```html
<!-- Render form value that updates automatically as user types -->
<p>Email: {{ loginForm.email().value() }}</p>
```

```typescript
// Get the current value
const currentEmail = loginForm.email().value();
```

### 5. Update field values with set()

You can programmatically update a field's value using the `value.set()` method. This updates both the field and the underlying model signal:

```typescript
// Update the value programmatically
loginForm.email().value.set('alice@wonderland.com');
```

As a result, both the field value and the model signal are updated automatically:

```typescript
// The model signal is also updated
console.log(loginModel().email); // 'alice@wonderland.com'
```

Here's a complete example:

#### app.ts

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, Field } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel);
}
```

#### app.html

```html
<form>
  <label>
    Email:
    <input
      type="email"
      [field]="loginForm.email"
    />
  </label>
  <label>
    Password:
    <input
      type="password"
      [field]="loginForm.password"
    />
  </label>
  <p>Hello {{ loginForm.email().value() }}!</p>
  <p>Password length: {{ loginForm.password().value().length }}</p>
</form>
```

#### app.css

```css
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

p {
  margin: 0.5rem 0;
  color: #666;
}
```

## Basic usage

The `[field]` directive works with all standard HTML input types. Here are the most common patterns:

### Text inputs

Text inputs work with various `type` attributes and textareas:

```html
<!-- Text and email -->
<input
  type="text"
  [field]="form.name"
/>
<input
  type="email"
  [field]="form.email"
/>
```

#### Numbers

Number inputs automatically convert between strings and numbers:

```html
<!-- Number - automatically converts to number type -->
<input
  type="number"
  [field]="form.age"
/>
```

#### Date and time

Date inputs store values as `YYYY-MM-DD` strings, and time inputs use `HH:mm` format:

```html
<!-- Date and time - stores as ISO format strings -->
<input
  type="date"
  [field]="form.eventDate"
/>
<input
  type="time"
  [field]="form.eventTime"
/>
```

If you need to convert date strings to Date objects, you can do so by passing the field value into `Date()`:

```typescript
const dateObject = new Date(form.eventDate().value());
```

#### Multiline text

Textareas work the same way as text inputs:

```html
<!-- Textarea -->
<textarea
  [field]="form.message"
  rows="4"
></textarea>
```

### Checkboxes

Checkboxes bind to boolean values:

```html
<!-- Single checkbox -->
<label>
  <input
    type="checkbox"
    [field]="form.agreeToTerms"
  />
  I agree to the terms
</label>
```

#### Multiple checkboxes

For multiple options, create a separate boolean `field` for each:

```html
<label>
  <input
    type="checkbox"
    [field]="form.emailNotifications"
  />
  Email notifications
</label>
<label>
  <input
    type="checkbox"
    [field]="form.smsNotifications"
  />
  SMS notifications
</label>
```

### Radio buttons

Radio buttons work similarly to checkboxes. As long as the radio buttons use the same `[field]` value, Signal Forms will automatically bind the same `name` attribute to all of them:

```html
<label>
  <input
    type="radio"
    value="free"
    [field]="form.plan"
  />
  Free
</label>
<label>
  <input
    type="radio"
    value="premium"
    [field]="form.plan"
  />
  Premium
</label>
```

When a user selects a radio button, the form `field` stores the value from that radio button's `value` attribute. For example, selecting "Premium" sets `form.plan().value()` to `"premium"`.

### Select dropdowns

Select elements work with both static and dynamic options:

```html
<!-- Static options -->
<select [field]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Dynamic options with @for -->
<select [field]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
  <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

**NOTE:** Multiple select (`<select multiple>`) is not supported by the `[field]` directive at this time.

## Validation and state

Signal Forms provides built-in validators that you can apply to your form fields. To add validation, pass a schema function as the second argument to `form()`:

```typescript
const loginForm = form(loginModel, schemaPath => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

The schema function receives a **schema path** parameter that provides paths to your fields for configuring validation rules.

Common validators include:

- **required()** - Ensures the field has a value
- **email()** - Validates email format
- **min()** / **max()** - Validates number ranges
- **minLength()** / **maxLength()** - Validates string or collection length
- **pattern()** - Validates against a regex pattern

You can also customize error messages by passing an options object as the second argument to the validator:

```typescript
required(schemaPath.email, { message: 'Email is required' });
email(schemaPath.email, { message: 'Please enter a valid email address' });
```

Each form field exposes its validation state through signals. For example, you can check `field().valid()` to see if validation passes, `field().touched()` to see if the user has interacted with it, and `field().errors()` to get the list of validation errors.

Here's a complete example:

#### app.ts

```typescript
import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, Field, required, email } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, schemaPath => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    // Perform login logic here
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);
    // e.g., await this.authService.login(credentials);
  }
}
```

#### app.html

```html
<form (submit)="onSubmit($event)">
  <div>
    <label>
      Email:
      <input
        type="email"
        [field]="loginForm.email"
      />
    </label>
    @if (loginForm.email().touched() && loginForm.email().invalid()) {
    <ul class="error-list">
      @for (error of loginForm.email().errors(); track error) {
      <li>{{ error.message }}</li>
      }
    </ul>
    }
  </div>
  <div>
    <label>
      Password:
      <input
        type="password"
        [field]="loginForm.password"
      />
    </label>
    @if (loginForm.password().touched() && loginForm.password().invalid()) {
    <div class="error-list">
      @for (error of loginForm.password().errors(); track error) {
      <p>{{ error.message }}</p>
      }
    </div>
    }
  </div>
  <button type="submit">Log In</button>
</form>
```

#### app.css

```css
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 500;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #4285f4;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #357ae8;
}

button:active {
  background-color: #2a65c8;
}

.error-list {
  color: red;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  padding-left: 0;
  list-style-position: inside;
}

.error-list p {
  margin: 0;
}
```

### Field State Signals

Every `field()` provides these state signals:

| State        | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `valid()`    | Returns true if the field passes all validation rules                  |
| `touched()`  | Returns true if the user has focused and blurred the field             |
| `dirty()`    | Returns true if the user has changed the value                         |
| `disabled()` | Returns true if the field is disabled                                  |
| `readonly()` | Returns true if the field is readonly                                  |
| `pending()`  | Returns true if async validation is in progress                        |
| `errors()`   | Returns an array of validation errors with kind and message properties |

## Next steps

To learn more about Signal Forms and how it works, check out the in-depth guides:

- **Overview** - Introduction to Signal Forms and when to use them
- **Form models** - Creating and managing form data with signals
- **Field state management** - Working with validation state, interaction tracking, and field visibility
- **Validation** - Built-in validators, custom validation rules, and async validation
