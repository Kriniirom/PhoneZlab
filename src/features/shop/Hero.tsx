import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-[#2a55e5] text-white overflow-hidden rounded-sm shadow-sm mx-4 mt-4">
      <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 relative">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-[#ffc200] text-black font-bold text-xs md:text-sm px-3 py-1 mb-4 rounded-sm">
            THE BIG TECH CARNIVAL
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight leading-none mb-2">
            UNBEATABLE DEALS ON INDIAN TECH ACCESSORIES
          </h1>
          <h2 className="text-3xl md:text-4xl font-black text-[#ffc200] italic mb-6">
            UP TO 70% OFF
          </h2>
          <p className="text-sm md:text-base font-medium mb-8 text-white/90">
            Extra 10% Instant Discount on Axis Bank & ICICI Credit Cards
          </p>
          <Link href="/collections/all" className="inline-block bg-[#ffc200] text-black font-bold px-8 py-3 rounded shadow hover:bg-yellow-400 transition-colors">
            SHOP GREAT OFFERS
          </Link>
        </div>

        {/* Carousel indicators (static for now) */}
        <div className="absolute bottom-6 right-8 flex gap-2">
          <div className="w-8 h-3 bg-[#ffc200] rounded-full"></div>
          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
