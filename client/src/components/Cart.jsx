import { useEffect, useState } from "react";
import { api, formatPrice } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { WHATSAPP_NUMBER } from "../constants";

export default function Cart() {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const [checkoutUrl, setCheckoutUrl] = useState("#");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!items.length) {
      setCheckoutUrl("#");
      return;
    }
    let message = "Hello, I want to place an order from BaloTech Gadget Hub:\n";
    items.forEach((item) => {
      const lineTotal = item.price * item.qty;
      const conditionText = item.condition ? ` — ${item.condition}` : "";
      message += `- ${item.name} x${item.qty} (₦${formatPrice(lineTotal)})${conditionText}\n`;
    });
    message += `\nTotal: ₦${formatPrice(totalPrice)}\n\nPlease confirm availability and delivery details.`;
    setCheckoutUrl(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    );
  }, [items, totalPrice]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!items.length || checkingOut) return;

    setCheckingOut(true);
    try {
      await api.createOrder({
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          condition: item.condition,
        })),
        total: totalPrice,
      });
      clearCart();
      showToast("Order saved — opening WhatsApp");
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Could not save order — opening WhatsApp anyway");
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <section id="cart" className="cart">
      <h2>Your Cart</h2>
      <ul id="cartItems">
        {items.length === 0 && <li className="cart-empty">Your cart is empty</li>}
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <span>
              {item.name} x{item.qty} - ₦{formatPrice(item.price * item.qty)}
              {item.condition ? ` (${item.condition})` : ""}
            </span>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p id="total">Total: ₦{formatPrice(totalPrice)}</p>
      <button
        type="button"
        className={`checkout-btn ${items.length && !checkingOut ? "" : "disabled"}`}
        disabled={!items.length || checkingOut}
        onClick={handleCheckout}
      >
        {checkingOut ? "Saving order..." : "Checkout on WhatsApp"}
      </button>
    </section>
  );
}
