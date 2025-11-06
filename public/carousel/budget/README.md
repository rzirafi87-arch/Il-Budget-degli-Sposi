# Carousel Budget Images

This directory should contain 3 images for the budget carousel:

1. `1.jpg` - Dashboard budget screenshot (recommended size: 1200x800px)
2. `2.jpg` - Budget table/expenses view (recommended size: 1200x800px)
3. `3.jpg` - Charts/graphs view (recommended size: 1200x800px)

## Image Requirements

- **Format**: JPEG (.jpg)
- **Dimensions**: 1200x800px (aspect ratio 16:9)
- **Size**: Optimized for web (< 300KB each)
- **Quality**: 85-90% JPEG quality

## Placeholder

Until you add the actual images, the carousel component will show error placeholders.
You can add placeholder images or use screenshots from your actual budget pages.

## Usage

The images are used by the `CarouselBudget` component in:
- `src/components/CarouselBudget.tsx`

To use in a page:
```tsx
import CarouselBudget from "@/components/CarouselBudget";

<CarouselBudget />
```
