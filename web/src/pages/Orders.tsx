import { Plus, Receipt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Card, EmptyState, ErrorAlert, PageHeader, Skeleton, StatusBadge } from '../components/ui';
import { formatDateTime, formatMoney } from '../format';
import { useApi } from '../useApi';

export function OrdersPage() {
  const navigate = useNavigate();
  const state = useApi((signal) => api.orders(signal), []);
  const orders = state.data?.orders;

  return (
    <div className="page">
      <PageHeader
        title="Orders"
        description="The 50 most recent orders."
        action={
          <Link to="/orders/new" className="button button-primary has-icon-start">
            <Plus size={16} strokeWidth={1.75} aria-hidden />
            New order
          </Link>
        }
      />

      {state.status === 'error' && <ErrorAlert message={state.error.message} />}

      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="align-right">Items</th>
                <th>Status</th>
                <th className="align-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {!orders &&
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <Skeleton height={16} />
                    </td>
                  </tr>
                ))}
              {orders?.map((order) => (
                <tr
                  key={order.id}
                  className="table-row-link"
                  tabIndex={0}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/orders/${order.id}`)}
                >
                  <td className="cell-primary num">#{order.id}</td>
                  <td className="cell-secondary num">{formatDateTime(order.createdAt)}</td>
                  <td>{order.customerEmail}</td>
                  <td className="align-right num">{order.itemCount}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="align-right num cell-primary">{formatMoney(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders?.length === 0 && <EmptyState icon={Receipt} title="No orders yet" />}
      </Card>
    </div>
  );
}
