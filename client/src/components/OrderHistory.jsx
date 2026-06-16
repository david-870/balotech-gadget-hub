import { api, formatDate, formatPrice } from "../api/client";
import { ORDER_STATUSES } from "../constants";

export default function OrderHistory({ orders, onStatusChange }) {
  if (!orders.length) {
    return <p className="admin-hint">No orders yet. Orders appear when customers checkout.</p>;
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <article key={order.id} className="order-card">
          <div className="order-card-header">
            <div>
              <h3>Order #{order.id}</h3>
              <p className="order-date">{formatDate(order.createdAt)}</p>
            </div>
            <select
              className={`order-status-select status-${order.status}`}
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <ul className="order-items">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} x{item.qty} — ₦{formatPrice(item.price * item.qty)}
                {item.condition ? ` (${item.condition})` : ""}
              </li>
            ))}
          </ul>
          <p className="order-total">Total: ₦{formatPrice(order.total)}</p>
        </article>
      ))}
    </div>
  );
}
