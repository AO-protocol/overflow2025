import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page not found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for may not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
