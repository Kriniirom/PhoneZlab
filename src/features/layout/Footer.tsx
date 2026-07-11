export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">PhoneZlab</h3>
          <p className="text-sm text-gray-500">
            Premium luxury accessories for the modern elite.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">All Products</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">New Arrivals</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Best Sellers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-black/5 dark:border-white/10 text-xs text-gray-400 flex flex-col md:flex-row items-center justify-between">
        <p>&copy; {new Date().getFullYear()} PhoneZlab. All rights reserved.</p>
        <p>Built with Next.js & Shopify</p>
      </div>
    </footer>
  );
}
