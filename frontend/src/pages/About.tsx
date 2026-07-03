export default function About() {
  return (
    <div className="container-custom py-16 md:py-24 max-w-3xl mx-auto">
      <h1 className="section-title text-center mb-8">About Joyara</h1>
      <div className="prose prose-sm text-secondary-600 mx-auto space-y-6">
        <p className="text-center text-lg leading-relaxed">
          Joyara is a premium women's fashion brand that celebrates elegance, comfort, and modern style.
          We believe that every woman deserves to feel confident and beautiful in what she wears.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
          <div>
            <h3 className="font-heading text-2xl text-secondary-900 mb-2">Quality</h3>
            <p className="text-sm">Handpicked fabrics and meticulous craftsmanship in every piece.</p>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-secondary-900 mb-2">Sustainability</h3>
            <p className="text-sm">Committed to ethical practices and sustainable fashion.</p>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-secondary-900 mb-2">Style</h3>
            <p className="text-sm">Blending timeless elegance with contemporary trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
