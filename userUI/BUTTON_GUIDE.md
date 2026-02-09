# Button Component Guide

## Overview
The Button component provides consistent, accessible buttons across the application with three variants: Primary, Secondary, and Outline.

## Standard Height
All CTA buttons use **52px height** (medium size) by default, achieved through padding rather than fixed height. This allows buttons to naturally grow with content while maintaining consistency.

## Variants

### Primary Button
- Background: `--primary` (#9DAE91)
- Text: `--primary-foreground` (#262D39)
- Hover: Changes to `--secondary` background with `--secondary-foreground` text
- Best for: Main call-to-action buttons

```tsx
<Button variant="primary">Get Started</Button>
<Button variant="primary" icon={ArrowRight} iconPosition="right">Continue</Button>
```

### Secondary Button
- Background: `--secondary` (#262D39)
- Text: `--secondary-foreground` (white)
- Hover: Opacity change
- Best for: Secondary actions, alternative CTAs

```tsx
<Button variant="secondary">Learn More</Button>
<Button variant="secondary" icon={Send}>Submit</Button>
```

### Outline Button
- Background: Transparent
- Border: 2px `--border`
- Text: `--foreground`
- Hover: Changes to `--secondary` background with `--secondary-foreground` text
- Best for: Tertiary actions, cancel buttons

```tsx
<Button variant="outline">Cancel</Button>
<Button variant="outline" icon={Eye}>Preview</Button>
```

## Sizes

### Small (sm) - ~40px height
Uses `py-2.5` (10px top/bottom padding)
```tsx
<Button size="sm">Small Button</Button>
```

### Medium (md) - ~52px height (DEFAULT)
Uses `py-3.5` (14px top/bottom padding)
```tsx
<Button>Medium Button</Button>
<Button size="md">Medium Button</Button>
```

### Large (lg) - ~56px height
Uses `py-4` (16px top/bottom padding)
```tsx
<Button size="lg">Large Button</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' | 'primary' | Button style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size (height) |
| icon | LucideIcon | - | Optional icon component |
| iconPosition | 'left' \| 'right' | 'left' | Icon placement |
| fullWidth | boolean | false | Makes button full width |
| disabled | boolean | false | Disables the button |
| href | string | - | Renders as link if provided |
| className | string | '' | Additional CSS classes |

## Features

✅ **Design System Integration**: All colors, typography, and spacing use CSS variables
✅ **Flexible Sizing**: 52px default height using padding (not fixed height)
✅ **Consistent Sizing**: Padding-based approach allows content to grow naturally
✅ **20px Icons**: Optimal icon size for 52px buttons
✅ **Hover Effects**: Smooth transitions using secondary color
✅ **Active States**: Scale effect for tactile feedback
✅ **Focus States**: WCAG compliant focus rings
✅ **Disabled States**: Proper opacity and cursor handling
✅ **Icon Support**: Left or right positioned icons with proper sizing
✅ **Link Support**: Can render as <a> tag with href prop
✅ **Responsive**: Full-width option for mobile layouts

## Accessibility

- Focus visible rings using `--ring` color
- Disabled states prevent interaction
- Proper ARIA attributes inherited from button element
- Touch target size meets WCAG AAA standards (52px default)

## Design System Variables Used

- `--primary`: Primary brand color
- `--primary-foreground`: Text on primary background
- `--secondary`: Secondary brand color
- `--secondary-foreground`: Text on secondary background
- `--border`: Border color
- `--foreground`: Default text color
- `--ring`: Focus ring color
- `--radius-button`: Border radius
- `--font-family`: Typography
- `--text-base`: Font size
- `--font-weight-medium`: Font weight