import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Custom 3D Prints,<br />Made for You
        </h1>
        <p className="text-indigo-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          From fidgets to figurines, every piece is printed fresh and shipped straight to your door.
          Quality you can hold in your hands.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-white text-indigo-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-indigo-50 transition-colors shadow-lg"
        >
          Browse the Shop
        </Link>
      </div>
    </section>
  );
}
