export interface MarketingImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: {
    author: string;
    source: string;
  };
}

export const MARKETING_IMAGES = {
  hero: {
    src: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&w=1200&q=80",
    alt: "Field technician in uniform servicing equipment with specialized maintenance tools",
    width: 1200,
    height: 800,
    credit: {
      author: "ThisisEngineering",
      source: "Unsplash",
    },
  },
  howItWorks: {
    src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    alt: "Service technician reviewing work order checklist and diagnostics on a digital tablet",
    width: 1200,
    height: 800,
    credit: {
      author: "ThisisEngineering",
      source: "Unsplash",
    },
  },
  acRepair: {
    src: "https://images.unsplash.com/photo-1647329797478-52c45b06856b?auto=format&fit=crop&w=1200&q=80",
    alt: "HVAC specialist performing diagnostic maintenance on an outdoor air conditioning condenser unit",
    width: 1200,
    height: 800,
    credit: {
      author: "Air Trust HVAC",
      source: "Unsplash",
    },
  },
  plumbing: {
    src: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
    alt: "Licensed plumber using pipe wrench to inspect and repair residential water fixtures",
    width: 1200,
    height: 800,
    credit: {
      author: "Vaz Plumbing",
      source: "Unsplash",
    },
  },
  electrical: {
    src: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    alt: "Certified electrician installing circuits and inspecting wires in an electrical breaker panel",
    width: 1200,
    height: 800,
    credit: {
      author: "Emmanuel Ikwuegbu",
      source: "Unsplash",
    },
  },
  appliance: {
    src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    alt: "Technician inspecting major home appliances and laundry equipment for repair",
    width: 1200,
    height: 800,
    credit: {
      author: "Castorly Stock",
      source: "Unsplash",
    },
  },
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;
