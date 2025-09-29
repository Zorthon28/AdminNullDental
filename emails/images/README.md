# Email Images Directory

This directory is for storing email-related images and assets.

## Logo Usage

### For Development/Testing

Place your logo file here (e.g., `logo.png`, `logo.jpg`, `logo.svg`)

### For Production

**Important**: Email images must be hosted on a public URL for reliable delivery. Do not reference local files in production emails.

### Recommended Logo Specifications

- **Format**: PNG or JPG (SVG has limited email client support)
- **Size**: 200x60px maximum (keep emails lightweight)
- **Background**: Transparent or white background
- **File Size**: Under 50KB for fast loading

## Usage in Templates

```tsx
import { Img } from '@react-email/components';

// For development (local file)
<Img
  src="./images/logo192.png"
  alt="NullDental"
  width="150"
  height="40"
  style={{ margin: '0 auto' }}
/>

// For production (hosted URL)
<Img
  src="./images/logo192.png"
  alt="NullDental"
  width="150"
  height="40"
  style={{ margin: '0 auto' }}
/>
```

## Hosting Recommendations

1. **CDN**: Use a CDN like Cloudflare, AWS S3, or Vercel for reliable delivery
2. **HTTPS**: Always use HTTPS URLs for images
3. **Fallback**: Consider text-only fallbacks for email clients that block images
4. **Optimization**: Compress images and use appropriate formats

## Email Client Image Support

- **Most clients**: Support images when enabled
- **Gmail**: May proxy images through Google servers
- **Outlook**: Generally good support
- **Apple Mail**: Excellent support
- **Mobile**: Generally good, but test on target devices

Always include descriptive `alt` text for accessibility and when images are blocked.
