import { Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button, Card, CardHeader, ErrorAlert, PageHeader, Skeleton } from '../components/ui';
import { formatMoney } from '../format';
import { useApi } from '../useApi';

interface Line {
  key: number;
  productId: number | '';
  quantity: number;
}

let nextKey = 1;
const emptyLine = (): Line => ({ key: nextKey++, productId: '', quantity: 1 });

export function NewOrderPage() {
  const navigate = useNavigate();
  const productsState = useApi((signal) => api.products({ limit: 100 }, signal), []);
  const products = productsState.data?.products;

  const [email, setEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const filledLines = lines.filter((line) => line.productId !== '');
  const estimatedSubtotal = filledLines.reduce((sum, line) => {
    const product = products?.find((p) => p.id === line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.createOrder({
        customerEmail: email,
        items: filledLines.map((line) => ({ productId: Number(line.productId), quantity: line.quantity })),
        discountCode: discountCode.trim() || undefined,
      });
      navigate(`/orders/${order.id}`, { state: { created: true } });
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="New order" description="Create an order on behalf of a customer, for example a phone order." />

      <form className="detail-grid" onSubmit={submit}>
        <Card>
          <CardHeader title="Order details" />
          <div className="card-body form-stack">
            <label className="field">
              <span className="field-label">Customer email</span>
              <input
                className="input"
                type="email"
                required
                autoComplete="off"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <div>
              <p className="section-label">Items</p>
              <div className="line-items">
                {lines.map((line, index) => (
                  <div key={line.key} className="line-item">
                    {products ? (
                      <select
                        className="select"
                        aria-label={`Product for line ${index + 1}`}
                        value={line.productId}
                        onChange={(e) =>
                          updateLine(line.key, { productId: e.target.value ? Number(e.target.value) : '' })
                        }
                      >
                        <option value="">Choose a product…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stock === 0}>
                            {p.name} · {formatMoney(p.price)} · {p.stock} in stock
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Skeleton height={36} />
                    )}
                    <input
                      className="input num"
                      type="number"
                      min={1}
                      aria-label={`Quantity for line ${index + 1}`}
                      value={line.quantity}
                      onChange={(e) => updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    />
                    <Button
                      variant="ghost"
                      icon={X}
                      iconOnly
                      aria-label={`Remove line ${index + 1}`}
                      disabled={lines.length === 1}
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                icon={Plus}
                style={{ marginTop: 8, marginLeft: -12 }}
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
              >
                Add item
              </Button>
            </div>

            <label className="field">
              <span className="field-label">Discount code</span>
              <input
                className="input"
                placeholder="Optional"
                autoComplete="off"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <span className="field-hint">Codes are not case-sensitive.</span>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Summary" />
          <div className="card-body form-stack">
            <div className="summary-list">
              <div className="summary-row">
                <span>Items</span>
                <strong>{filledLines.reduce((n, line) => n + line.quantity, 0)}</strong>
              </div>
              <div className="summary-row total">
                <span>Subtotal</span>
                <strong>{formatMoney(estimatedSubtotal)}</strong>
              </div>
              <p className="field-hint">Discounts are applied when the order is placed.</p>
            </div>
            {error && <ErrorAlert message={error} />}
            <Button type="submit" variant="primary" disabled={submitting || filledLines.length === 0}>
              {submitting ? 'Placing order…' : 'Place order'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
