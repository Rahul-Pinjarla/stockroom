CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE discount_codes (
  code TEXT PRIMARY KEY,
  percent_off INTEGER NOT NULL CHECK (percent_off BETWEEN 1 AND 100),
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'cancelled')),
  subtotal DOUBLE PRECISION NOT NULL,
  discount_code TEXT REFERENCES discount_codes (code),
  discount_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_created_at_idx ON orders (created_at);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DOUBLE PRECISION NOT NULL,
  line_total DOUBLE PRECISION NOT NULL
);

CREATE INDEX order_items_order_id_idx ON order_items (order_id);
