// App.jsx
import { useState, useEffect, createContext, useContext } from "react";

// ---------------- CART CONTEXT ----------------
const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

// ---------------- NAVBAR ----------------
function Navbar({ onCartToggle }) {
  const { cart } = useCart();

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-600 text-white sticky top-0 z-10">
      <h1 className="text-xl font-bold">🛍 MyShop</h1>
      <button
        onClick={onCartToggle}
        className="flex items-center bg-blue-800 px-3 py-1 rounded-lg"
      >
        🛒 <span className="ml-2">{cart.length}</span>
      </button>
    </nav>
  );
}

// ---------------- FOOTER ----------------
function Footer() {
  return (
    <footer className="mt-6 p-4 bg-gray-800 text-white text-center">
      <p>© {new Date().getFullYear()} MyShop. All rights reserved.</p>
    </footer>
  );
}

// ---------------- PRODUCT CARD ----------------
function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-lg shadow-md p-4 flex flex-col justify-between">
      <img src={product.image} alt={product.title} className="h-40 mx-auto" />
      <h2 className="text-lg font-semibold mt-2 line-clamp-2">
        {product.title}
      </h2>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}

// ---------------- PRODUCT LIST ----------------
function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(1000);

  // Fetch products & categories
  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch("https://fakestoreapi.com/products/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    const matchesPrice = p.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>

        <div>
          <label className="block text-sm font-semibold">
            Max Price: ${maxPrice}
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- CART MODAL ----------------
function CartModal({ isOpen, onClose }) {
  const { cart, removeFromCart, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-20">
      <div className="w-80 bg-white h-full p-4 shadow-xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">🛒 Shopping Cart</h2>
        <button
          className="absolute top-2 right-4 text-2xl font-bold text-gray-600"
          onClick={onClose}
        >
          ×
        </button>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm">Qty: {item.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
            <p className="mt-4 font-bold">Total: ${totalPrice.toFixed(2)}</p>
            <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg">
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- APP ----------------
export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartProvider>
      <Navbar onCartToggle={() => setIsCartOpen(true)} />
      <Products />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
    </CartProvider>
  );
}
