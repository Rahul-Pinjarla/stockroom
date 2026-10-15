import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, type Product } from '../api';
import { Button, Card, EmptyState, ErrorAlert, PageHeader, Skeleton } from '../components/ui';
import { formatDate, formatMoney, formatNumber } from '../format';

const PAGE_SIZE = 20;
const LOW_STOCK = 5;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .products({ limit: PAGE_SIZE }, controller.signal)
      .then((page) => {
        setProducts(page.products);
        setTotal(page.total);
        setCursor(page.nextCursor);
      })
      .catch((e: Error) => !controller.signal.aborted && setError(e.message));
    return () => controller.abort();
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    setError(null);
    try {
      const page = await api.products({ limit: PAGE_SIZE, cursor });
      setProducts((prev) => [...(prev ?? []), ...page.products]);
      setTotal(page.total);
      setCursor(page.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Products" description="Everything in your catalog, oldest first." />

      {error && <ErrorAlert message={error} />}

      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="align-right">Price</th>
                <th className="align-right">In stock</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {!products &&
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={4}>
                      <Skeleton height={16} />
                    </td>
                  </tr>
                ))}
              {products?.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="cell-primary">{product.name}</div>
                    <div className="cell-secondary">{product.sku}</div>
                  </td>
                  <td className="align-right num">{formatMoney(product.price)}</td>
                  <td className="align-right num">
                    {product.stock <= LOW_STOCK ? (
                      <span className="badge badge-warning">{formatNumber(product.stock)} left</span>
                    ) : (
                      formatNumber(product.stock)
                    )}
                  </td>
                  <td className="cell-secondary">{formatDate(product.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products?.length === 0 && <EmptyState icon={Package} title="No products yet" />}
        {products && products.length > 0 && (
          <div className="table-footer">
            <span className="num">
              Showing {formatNumber(products.length)} of {formatNumber(total)} products
            </span>
            {cursor && (
              <Button onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
