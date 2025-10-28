Assets guide: carousels and social logos

Carousels
- Images live under `public/carousels/<key>/`.
- A default themed set is provided in `public/carousels/default/` as SVGs.
- Configure what to show per section in `src/lib/carousels.ts` (`CAROUSEL_IMAGES`).
- Use component `src/components/Carousel.tsx`:
  
  Example:
  
  import Carousel from "@/components/Carousel";
  import { CAROUSEL_IMAGES } from "@/lib/carousels";
  
  <Carousel images={CAROUSEL_IMAGES["atelier"]} />

Social logos
- Place official brand SVGs into `public/logos/` with names:
  - `facebook.svg`, `instagram.svg`, `youtube.svg`, `tiktok.svg`, `pinterest.svg`
- Temporary placeholders are provided. Replace with official assets when ready, following brand guidelines.
- Render via `src/components/SocialIcons.tsx`:
  
  import SocialIcons from "@/components/SocialIcons";
  
  <SocialIcons
    items={[
      { name: "Facebook", href: "https://facebook.com/yourpage", src: "/logos/facebook.svg", alt: "Facebook" },
      { name: "Instagram", href: "https://instagram.com/yourprofile", src: "/logos/instagram.svg", alt: "Instagram" },
    ]}
  />

Notes
- SVGs are lightweight and scale well. For photos, prefer `.jpg` optimized to 1600px wide, quality ~80.
- If you add new sections, update the `CarouselKey` union type and `CAROUSEL_IMAGES` mapping.
- Keep alt texts meaningful for accessibility and SEO.

