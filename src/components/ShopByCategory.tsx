import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ProductCategory } from '../types';

interface CategoryCardItem {
  name: ProductCategory;
  displayName: string;
  image: string;
  description: string;
  tag: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    name: 'Sets',
    displayName: 'Bridal Necklace Sets',
    image: '/images/sample-necklace-1.jpg',
    description: 'Complete bridal Kundan & polki choker sets with matching jhumkas',
    tag: 'Signature Bridal',
  },
  {
    name: 'Chokers',
    displayName: 'Chokers & Heritage Malas',
    image: '/images/featured-temple-necklace.jpg',
    description: 'Antique temple necklaces, mango malas & regal collar chokers',
    tag: 'Traditional',
  },
  {
    name: 'Earrings',
    displayName: 'Jhumkas & Earrings',
    image: '/images/sample-necklace-2.jpg',
    description: 'Heavy bridal jhumkas, chandelier drops & floral ear studs',
    tag: 'Handcrafted',
  },
  {
    name: 'Bangles',
    displayName: 'Bangles & Kangans',
    image: '/images/featured-bridal-bangles.jpg',
    description: 'Gold-finish bridal chudas, antique kangans & gemstone bangles',
    tag: 'Bridal Stacks',
  },
  {
    name: 'Bracelets',
    displayName: "Men's Royal Kadas",
    image: '/images/sample-kada-1.jpg',
    description: "Carved Rajputi lion kadas & antique men's gold-plated bracelets",
    tag: "Men's Special",
  },
  {
    name: 'Other',
    displayName: 'Haathphool & Headpieces',
    image: '/images/featured-haathphool.jpg',
    description: 'Floral hand harnesses, matha patti, maang tikkas & cocktail rings',
    tag: 'Accessories',
  },
];

interface ShopByCategoryProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({ onSelectCategory }) => {
  return (
    <section className="bg-[#FAF4EA] py-12 sm:py-16 lg:py-20 border-b border-[#F4D9A0]/60 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Typography Stagger */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 stagger-heading">
          <span className="heading-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F4D9A0] text-[#7A1830] text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C8792C]" />
            <span>Curated Collections</span>
          </span>
          <h2 className="heading-title font-heading text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl text-[#302218] font-semibold mt-2.5">
            Shop by Category
          </h2>
          <div className="heading-divider w-20 h-0.5 bg-gradient-to-r from-[#7A1830] via-[#C8792C] to-[#F4D9A0] mx-auto mt-2" />
          <p className="heading-subtitle text-xs sm:text-base text-[#5B4632] mt-2 font-light">
            Select a jewellery category to instantly browse tailored styles and pricing in our catalogue.
          </p>
        </div>

        {/* Visual Category Grid with Staggered Cascading Entrances */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5 stagger-container">
          {CATEGORY_CARDS.map((cat) => (
            <div
              key={cat.displayName}
              onClick={() => onSelectCategory(cat.name)}
              className="stagger-card group bg-white rounded-2xl border border-[#F4D9A0]/70 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Category Image */}
              <div className="relative aspect-square w-full bg-[#FAF4EA] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.displayName}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#7A1830] text-white shadow-xs">
                    {cat.tag}
                  </span>
                </div>
              </div>

              {/* Category Title & Action */}
              <div className="p-3 text-left">
                <h3 className="font-heading text-sm sm:text-base font-semibold text-[#302218] group-hover:text-[#7A1830] transition-colors leading-tight">
                  {cat.displayName}
                </h3>
                <div className="flex items-center text-[10px] text-[#C8792C] font-semibold mt-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

