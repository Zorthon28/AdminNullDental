# React Email Templates

This directory contains React Email templates for NullDental's automated email notifications.

## Development

### Live Preview

To preview email templates during development, run:

```bash
npm run email:dev
```

This starts a local development server where you can:

- Live preview email templates in different email clients
- Test responsive design
- Debug rendering issues
- See how emails look across devices

### Available Templates

1. **License Issued** (`license-issued.tsx`)
   - Sent when new licenses are created
   - Shows license details and clinic information

2. **License Expiry Warning** (`license-expiry-warning.tsx`)
   - Automated warnings for expiring licenses
   - Color-coded urgency based on days remaining

3. **New Clinic Notification** (`new-clinic-notification.tsx`)
   - Sent when new clinics are registered
   - Welcome message with clinic details

4. **Weekly Report** (`weekly-report.tsx`)
   - System statistics and summaries
   - License and clinic counts

5. **Test Email** (`test-email.tsx`)
   - For testing email configuration
   - Simple confirmation message

## Template Structure

Each template follows this structure:

```tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface TemplateProps {
  // Props for dynamic content
}

export const TemplateName = (props: TemplateProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>{/* Email content */}</Container>
      </Body>
    </Html>
  );
};
```

## Styling Guidelines

- Use inline styles (required for email compatibility)
- Test across email clients (Gmail, Outlook, Apple Mail, etc.)
- Keep layouts simple and responsive
- Use NullDental brand colors and fonts
- Ensure good contrast for accessibility

## Email Client Compatibility

### ❌ **Avoid These CSS Properties** (Poor Email Support)

- `gap`, `column-gap`, `row-gap` - Not supported in Outlook, Windows Mail
- `flexbox` advanced features - Limited support in older clients
- `grid` layouts - Very limited support
- `calc()` - Not supported in many clients
- `vh/vw` units - Not supported in email
- CSS custom properties (variables) - Not supported

### ✅ **Safe CSS Properties**

- `margin`, `padding` - Universally supported
- `display: block/inline/inline-block` - Safe for layouts
- `float` - For simple layouts (with clear)
- `width`, `height` - With px/% units
- `text-align`, `vertical-align` - For alignment
- `border`, `background-color` - For styling
- Tables - Most reliable for complex layouts

### **Layout Best Practices**

- Use `<table>` for complex layouts instead of flexbox/grid
- Use margins/padding instead of gap properties
- Test in Outlook 2013+ and Gmail for compatibility
- Keep layouts simple - email clients have limited CSS support

## Email Client Testing

React Email provides built-in testing for:

- Gmail (web and mobile)
- Outlook (desktop and web)
- Apple Mail
- Yahoo Mail
- And more...

## Integration

Templates are automatically rendered to HTML using `@react-email/render` and sent via Resend API. See `src/lib/email.ts` for usage examples.

## Adding Images/Logos

1. **For Development**: Place logo in `emails/images/` directory
2. **For Production**: Host on CDN (Cloudflare, AWS S3, Vercel)
3. **Import**: Add `Img` to React Email imports
4. **Usage**: Use hosted HTTPS URLs in templates

```tsx
import { Img } from "@react-email/components";

<Img
  src="https://your-cdn.com/logo.png"
  alt="NullDental"
  width="150"
  height="40"
  style={{ margin: "0 auto", display: "block" }}
/>;
```

## Adding New Templates

1. Create new `.tsx` file in this directory
2. Export the component as default
3. Add rendering function in `src/lib/email.ts`
4. Update settings if needed for configuration
5. Test with `npm run email:dev`

## Best Practices

- Keep templates focused and concise
- Use semantic HTML elements
- Test with real data before deployment
- Include unsubscribe links if applicable
- Ensure mobile responsiveness
- Use alt text for images
- Avoid complex CSS (stick to inline styles)
