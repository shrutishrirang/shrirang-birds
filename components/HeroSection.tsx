import Link from 'next/link'

interface Props {
  birdCount: number
}

export default function HeroSection({ birdCount }: Props) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">


      {/* Bird silhouette vector background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-birds.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-35"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Main hero text */}
      <div className="text-center max-w-5xl mx-auto">

        {/* Kicker */}
        <p className="hero-line hero-line-1 font-display font-light text-xs tracking-widest3 uppercase text-forest mb-8">
          Photographer | Avid Birder
        </p>

        {/* Name — the centrepiece */}
        <h1 className="hero-line hero-line-2 font-maiandra font-thin text-[clamp(3rem,10vw,8rem)] leading-none tracking-widest uppercase text-bark-mid mb-2">
          Shrirang
        </h1>
        <h1 className="hero-line hero-line-2 font-maiandra font-thin text-[clamp(3rem,10vw,8rem)] leading-none tracking-widest uppercase text-bark-mid mb-10">
          Mukta
        </h1>

        {/* Stats row */}
        <div className="hero-line hero-line-3 flex items-center justify-center gap-6 md:gap-12 mb-12">
          {[
            { value: birdCount.toLocaleString(), label: 'Species' },
            { value: '5', label: 'Countries' },
            { value: '∞', label: 'Curiosity' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-light text-2xl md:text-3xl text-forest">
                {value}
              </div>
              <div className="font-body text-[11px] tracking-widest uppercase text-bark-light mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="hero-line hero-line-4">
          <Link
            href="#collection"
            className="inline-flex items-center gap-3 font-display font-light text-xs tracking-widest2 uppercase bg-forest text-parchment-50 border border-forest px-8 py-3 hover:bg-forest-dark transition-all duration-300"
          >
            Explore the Birds Archive
          </Link>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
        <div className="w-px h-8 bg-bark-light" />
      </div>
    </section>
  )
}
