import { useEffect, useRef } from 'react';
import { HeroBannerEditable } from './preview/HeroBannerEditable';
import { CategoriesEditable } from './preview/CategoriesEditable';
import { BestsellersEditable } from './preview/BestsellersEditable';
import { CTASectionEditable } from './preview/CTASectionEditable';
import { NavbarEditable } from './preview/NavbarEditable';
import { FooterEditable } from './preview/FooterEditable';

export function SitePreview() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll to top when component mounts
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="bg-background">
      {/* Navbar always visible at top */}
      <NavbarEditable />
      
      {/* Scrollable content area */}
      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">
        <main>
          <HeroBannerEditable />
          <CategoriesEditable />
          <BestsellersEditable />
          <CTASectionEditable />
        </main>
        <FooterEditable />
      </div>
    </div>
  );
}
