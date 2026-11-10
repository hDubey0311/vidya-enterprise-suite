import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, Boxes, Building2, CalendarDays, Check,
  ChevronDown, CircleDollarSign, ClipboardList, Clock3, CreditCard, Download, Ellipsis,
  FileText, Filter, LayoutDashboard, LogIn, LogOut, Menu, Package, Plus, Search, Settings2,
  ShoppingBag, ShoppingCart, Truck, Users, Wallet, X,
} from "lucide-react";
import { toast } from "sonner";
import { AuthUserContext } from "@/lib/auth-state";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import catalogPhoto from "@/assets/vidya-wholesale-catalog.jpg";

type Role = "Admin" | "Customer" | "Salesperson" | "Delivery";
type View = "Overview" | "Orders" | "Products" | "Customers" | "Pricing" | "Deliveries";
type IconComponent = typeof LayoutDashboard;

const roles: { name: Role; subtitle: string }[] = [
  { name: "Admin", subtitle: "Business overview" },
  { name: "Customer", subtitle: "Shop wholesale" },
  { name: "Salesperson", subtitle: "Sales workspace" },
  { name: "Delivery", subtitle: "Delivery runs" },
];

const modules: { title: string; items: { view: View; icon: IconComponent }[] }[] = [
  { title: "WORKSPACE", items: [{ view: "Overview", icon: LayoutDashboard }, { view: "Orders", icon: ClipboardList }] },
  { title: "COMMERCE", items: [{ view: "Products", icon: Package }, { view: "Customers", icon: Users }, { view: "Pricing", icon: CircleDollarSign }] },
  { title: "FULFILMENT", items: [{ view: "Deliveries", icon: Truck }] },
];

const ordersSeed = [
  { id: "VD-2849", customer: "Green Basket Stores", date: "Today, 09:42", items: 18, amount: 24850, status: "Processing", city: "Pune" },
  { id: "VD-2848", customer: "Mehta General Mart", date: "Today, 09:18", items: 12, amount: 16400, status: "Packed", city: "Pune" },
  { id: "VD-2847", customer: "Fresh Fields Market", date: "Today, 08:56", items: 24, amount: 32750, status: "Out for delivery", city: "Mumbai" },
  { id: "VD-2846", customer: "Shree Provision Co.", date: "Yesterday, 16:24", items: 9, amount: 11820, status: "Delivered", city: "Pune" },
  { id: "VD-2845", customer: "Daily Needs Corner", date: "Yesterday, 15:08", items: 16, amount: 21600, status: "Delivered", city: "Nashik" },
];

const products = [
  { sku: "GRC-1048", name: "Premium Basmati Rice", pack: "25 kg bag", category: "Staples", price: 1840, stock: 248, unit: "bags" },
  { sku: "GRC-2216", name: "Cold-Pressed Sunflower Oil", pack: "15 L tin", category: "Cooking oil", price: 2125, stock: 86, unit: "tins" },
  { sku: "GRC-0893", name: "Toor Dal · Premium", pack: "30 kg bag", category: "Pulses", price: 3840, stock: 154, unit: "bags" },
  { sku: "GRC-3310", name: "Assam Tea · Strong Leaf", pack: "10 × 1 kg", category: "Beverages", price: 2760, stock: 42, unit: "cases" },
  { sku: "GRC-1475", name: "Refined Sugar · Grade A", pack: "50 kg bag", category: "Staples", price: 2280, stock: 312, unit: "bags" },
  { sku: "GRC-5721", name: "Dishwash Bar · Lemon", pack: "48 × 200 g", category: "Household", price: 1160, stock: 18, unit: "cases" },
];

const customers = [
  { name: "Green Basket Stores", contact: "Aarav Patel", location: "Pune, Maharashtra", tier: "Gold", spend: 384500, orders: 42, initials: "GB" },
  { name: "Mehta General Mart", contact: "Nisha Mehta", location: "Pune, Maharashtra", tier: "Silver", spend: 218300, orders: 28, initials: "MM" },
  { name: "Fresh Fields Market", contact: "Rahul Desai", location: "Mumbai, Maharashtra", tier: "Gold", spend: 496200, orders: 56, initials: "FF" },
  { name: "Shree Provision Co.", contact: "Kavita Shah", location: "Pune, Maharashtra", tier: "Silver", spend: 167800, orders: 21, initials: "SP" },
  { name: "Daily Needs Corner", contact: "Imran Khan", location: "Nashik, Maharashtra", tier: "Bronze", spend: 92800, orders: 14, initials: "DN" },
];

const formatMoney = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function roleHome(role: Role): View {
  if (role === "Customer") return "Products";
  if (role === "Delivery") return "Deliveries";
  return "Overview";
}

export function VidyaApp() {
  const user = useContext(AuthUserContext);
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Admin");
  const [view, setView] = useState<View>("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("All orders");
  const [productCategory, setProductCategory] = useState("All products");
  const [delivered, setDelivered] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [priceTier, setPriceTier] = useState("Gold");

  useEffect(() => {
    setView(roleHome(role));
    setSearch("");
    setMobileNavOpen(false);
  }, [role]);

  const roleNav = useMemo(() => {
    if (role === "Customer") return [
      { title: "SHOP", items: [{ view: "Products" as View, icon: ShoppingBag }, { view: "Orders" as View, icon: ClipboardList }, { view: "Pricing" as View, icon: CreditCard }] },
    ];
    if (role === "Salesperson") return [
      { title: "SALES", items: [{ view: "Overview" as View, icon: LayoutDashboard }, { view: "Orders" as View, icon: ClipboardList }, { view: "Customers" as View, icon: Users }, { view: "Products" as View, icon: Package }] },
    ];
    if (role === "Delivery") return [
      { title: "MY ROUTE", items: [{ view: "Deliveries" as View, icon: Truck }, { view: "Orders" as View, icon: ClipboardList }] },
    ];
    return modules;
  }, [role]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("You’ve signed out.");
  }

  function selectView(nextView: View) {
    setView(nextView);
    setSearch("");
    setMobileNavOpen(false);
  }

  const filteredOrders = ordersSeed.filter((order) => {
    const queryMatch = `${order.id} ${order.customer} ${order.city} ${order.status}`.toLowerCase().includes(search.toLowerCase());
    const filterMatch = orderFilter === "All orders" || order.status === orderFilter;
    return queryMatch && filterMatch;
  });
  const filteredProducts = products.filter((product) => {
    const queryMatch = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(search.toLowerCase());
    return queryMatch && (productCategory === "All products" || product.category === productCategory);
  });
  const filteredCustomers = customers.filter((customer) => `${customer.name} ${customer.contact} ${customer.location}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="vidya-app min-h-screen bg-background text-foreground">
      <aside className={`app-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/" className="vidya-brand" aria-label="Vidya Enterprise overview" onClick={() => selectView("Overview")}>
            <span className="vidya-mark"><Building2 size={19} strokeWidth={1.8} /></span>
            <span className="font-semibold">vidya<span className="brand-enterprise"> enterprise</span></span>
          </Link>
          <Button variant="ghost" size="icon" className="sidebar-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X /></Button>
        </div>
        <div className="sidebar-company">
          <span className="company-avatar"><Building2 size={16} /></span>
          <span className="company-copy"><strong>Vidya Wholesale</strong><small>West India · Main branch</small></span>
          <ChevronDown size={15} className="text-muted-foreground" />
        </div>
        <div className="sidebar-roles" aria-label="Choose workspace role">
          <p className="sidebar-section-label">WORKSPACE VIEW</p>
          <div className="role-switcher">
            {roles.map((item) => <Button key={item.name} variant="ghost" size="sm" className={role === item.name ? "role-active" : "role-button"} onClick={() => setRole(item.name)}>{item.name}</Button>)}
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Business modules">
          {roleNav.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="sidebar-section-label">{group.title}</p>
              {group.items.map(({ view: itemView, icon: Icon }) => (
                <Button key={itemView} variant="ghost" className={`nav-item ${view === itemView ? "nav-active" : ""}`} aria-current={view === itemView ? "page" : undefined} onClick={() => selectView(itemView)}>
                  <Icon size={17} strokeWidth={1.8} /><span>{itemView}</span>
                  {itemView === "Orders" && role !== "Customer" && role !== "Delivery" && <span className="nav-count">8</span>}
                </Button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-note"><span className="preview-dot" /><span>Preview data</span><span className="preview-note-detail">Not connected</span></div>
          <Button variant="ghost" className="nav-item settings-item" onClick={() => toast("Workspace settings will be added in a later phase.")}><Settings2 size={17} /><span>Settings</span></Button>
          <div className="account-row">
            <div className="user-avatar">{user?.email?.slice(0, 1).toUpperCase() ?? "VD"}</div>
            <div className="account-copy"><strong>{user?.email?.split("@")[0] ?? "Vidya team"}</strong><small>{role}</small></div>
            {user ? <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={signOut}><LogOut size={16} /></Button> : <Button variant="ghost" size="icon" aria-label="Sign in" title="Sign in" onClick={() => navigate({ to: "/auth" })}><LogIn size={16} /></Button>}
          </div>
        </div>
      </aside>
      {mobileNavOpen && <button type="button" className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <main className="app-main">
        <header className="app-header">
          <Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></Button>
          <div className="breadcrumb"><span>Vidya Wholesale</span><span className="breadcrumb-separator">/</span><strong>{view}</strong></div>
          <div className="header-actions">
            <div className="header-preview"><span className="preview-dot" />Preview data · Not live</div>
            {role === "Customer" && <Button variant="outline" size="sm" onClick={() => toast(cartCount ? `${cartCount} preview item${cartCount === 1 ? "" : "s"} in your cart.` : "Your cart is empty.")}><ShoppingCart size={16} /><span>Cart</span><span className="cart-count">{cartCount}</span></Button>}
            <Button variant="ghost" size="icon" aria-label="Notifications" title="Notifications" onClick={() => toast("You’re all caught up.")}><span className="notification-icon"><Clock3 size={18} /></span></Button>
            {!user && <Button variant="outline" size="sm" onClick={() => navigate({ to: "/auth" })}>Sign in</Button>}
            <div className="header-avatar">{user?.email?.slice(0, 1).toUpperCase() ?? "V"}</div>
          </div>
        </header>
        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{role === "Admin" ? "TUESDAY, 10 NOVEMBER" : `${role.toUpperCase()} WORKSPACE`}</div>
              <h1>{view === "Overview" ? `Good morning${role === "Admin" ? ", team" : role === "Salesperson" ? ", Priya" : ""}` : pageTitle(role, view)}</h1>
              <p>{subtitle(role, view)}</p>
            </div>
            <div className="heading-actions">
              {view === "Overview" && <Button variant="outline" size="sm" onClick={() => toast("Your preview report is ready to export.")}><Download size={15} /> Export</Button>}
              {role !== "Delivery" && view === "Orders" && <Button size="sm" onClick={() => role === "Customer" ? setCartCount((count) => count + 1) : toast("New order entry will be available when business data is connected.")}><Plus size={16} />{role === "Customer" ? "Quick add" : "New order"}</Button>}
              {role === "Admin" && view === "Products" && <Button size="sm" onClick={() => toast("Product creation will be available when the catalog is connected.")}><Plus size={16} /> Add product</Button>}
              {role === "Admin" && view === "Customers" && <Button size="sm" onClick={() => toast("Customer creation will be available when customer records are connected.")}><Plus size={16} /> Add customer</Button>}
            </div>
          </div>
          {view !== "Overview" && view !== "Pricing" && view !== "Deliveries" && <div className="list-toolbar">
            <div className="search-wrap"><Search size={16} /><Input aria-label={`Search ${view.toLowerCase()}`} placeholder={`Search ${view.toLowerCase()}…`} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            {view === "Orders" && <label className="filter-wrap"><Filter size={15} /><select aria-label="Order status filter" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}><option>All orders</option>{["Processing", "Packed", "Out for delivery", "Delivered"].map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label>}
            {view === "Products" && <label className="filter-wrap"><Filter size={15} /><select aria-label="Product category filter" value={productCategory} onChange={(event) => setProductCategory(event.target.value)}><option>All products</option>{[...new Set(products.map((product) => product.category))].map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={14} /></label>}
            <span className="results-count">{view === "Orders" ? filteredOrders.length : view === "Products" ? filteredProducts.length : filteredCustomers.length} results</span>
          </div>}

          {view === "Overview" && <Overview role={role} onNavigate={selectView} />}
          {view === "Orders" && <OrdersView role={role} orders={filteredOrders} />}
          {view === "Products" && <ProductsView role={role} products={filteredProducts} category={productCategory} onAdd={() => setCartCount((count) => count + 1)} />}
          {view === "Customers" && <CustomersView customers={filteredCustomers} />}
          {view === "Pricing" && <PricingView role={role} priceTier={priceTier} onTierChange={setPriceTier} />}
          {view === "Deliveries" && <DeliveriesView delivered={delivered} onMarkDelivered={(id) => setDelivered((current) => current.includes(id) ? current : [...current, id])} />}
          <footer className="app-footer"><span>© 2026 Vidya Enterprise</span><span><span className="footer-dot" /> All figures shown are illustrative preview data</span></footer>
        </section>
      </main>
    </div>
  );
}

function pageTitle(role: Role, view: View) {
  if (role === "Customer" && view === "Products") return "Shop wholesale";
  if (role === "Customer" && view === "Orders") return "Your orders";
  if (role === "Customer" && view === "Pricing") return "Your price list";
  if (role === "Delivery" && view === "Deliveries") return "Today’s route";
  return view;
}

function subtitle(role: Role, view: View) {
  if (view === "Overview") return role === "Salesperson" ? "Your accounts, orders, and targets at a glance." : "Here’s what’s happening across your business today.";
  if (view === "Orders") return role === "Customer" ? "Track your orders and review past purchases." : "Review and manage incoming wholesale orders.";
  if (view === "Products") return role === "Customer" ? "Explore the assortment available to your business." : "Browse your wholesale assortment and current stock.";
  if (view === "Customers") return "Your customer relationships, all in one place.";
  if (view === "Pricing") return role === "Customer" ? "Your negotiated wholesale prices." : "Manage customer-specific pricing tiers.";
  if (view === "Deliveries") return "Your scheduled stops and delivery progress.";
  return "Wholesale operations at a glance.";
}

function Overview({ role, onNavigate }: { role: Role; onNavigate: (view: View) => void }) {
  const metrics = role === "Customer"
    ? [{ label: "Open orders", value: "3", delta: "2 arriving today", icon: ClipboardList }, { label: "This month", value: "₹86,420", delta: "Across 12 orders", icon: Wallet }, { label: "Available credit", value: "₹1.4L", delta: "Your credit limit", icon: CreditCard }]
    : role === "Salesperson"
      ? [{ label: "Sales this month", value: "₹8.42L", delta: "+12.8% vs last month", icon: CircleDollarSign }, { label: "Open orders", value: "24", delta: "8 need attention", icon: ClipboardList }, { label: "Active accounts", value: "38", delta: "+3 this month", icon: Users }]
      : role === "Delivery"
        ? [{ label: "Stops today", value: "12", delta: "4 completed", icon: Truck }, { label: "Packages", value: "28", delta: "Across all stops", icon: Package }, { label: "Route progress", value: "33%", delta: "Next stop in 2.4 km", icon: ArrowUpRight }]
        : [{ label: "Gross sales", value: "₹12.84L", delta: "+12.8% vs last month", icon: CircleDollarSign }, { label: "Orders today", value: "86", delta: "+8.2% vs yesterday", icon: ClipboardList }, { label: "Active customers", value: "248", delta: "+14 this month", icon: Users }, { label: "Pending fulfilment", value: "18", delta: "6 orders at risk", icon: Truck }];
  return <>
    <div className={`metrics-grid ${metrics.length === 3 ? "three" : ""}`}>
      {metrics.map(({ label, value, delta, icon: Icon }, index) => <div className="metric" key={label}><div className="metric-top"><span>{label}</span><span className={`metric-icon metric-icon-${index % 4}`}><Icon size={17} strokeWidth={1.8} /></span></div><strong>{value}</strong><div className={`metric-delta ${delta.includes("attention") || delta.includes("risk") ? "warning-text" : ""}`}>{index === 0 && role !== "Delivery" ? <ArrowUpRight size={14} /> : <span className="metric-dot" />}{delta}</div></div>)}
    </div>
    <div className="overview-grid">
      <section className="surface chart-surface">
        <div className="surface-head"><div><h2>{role === "Customer" ? "Purchase activity" : role === "Delivery" ? "Route progress" : "Sales performance"}</h2><p>{role === "Delivery" ? "Your deliveries today" : "Revenue over the last 7 days"}</p></div><Button variant="outline" size="sm" onClick={() => onNavigate(role === "Delivery" ? "Deliveries" : "Orders")}>{role === "Delivery" ? "View route" : "This week"}<ChevronDown size={14} /></Button></div>
        {role === "Delivery" ? <div className="route-progress"><div className="route-progress-line"><span /></div><div className="route-progress-stats"><span><strong>4</strong> stops complete</span><span><strong>8</strong> remaining</span></div><div className="next-stop"><span className="next-stop-icon"><Truck size={17} /></span><div><small>NEXT STOP · 2.4 KM</small><strong>Mehta General Mart</strong><span>FC Road, Pune · 11:30 – 12:00</span></div><ArrowRight size={17} /></div></div> : <div className="chart-area"><div className="chart-y-labels"><span>₹4L</span><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span></div><div className="chart-plot"><div className="chart-grid-lines"><span /><span /><span /><span /><span /></div><div className="chart-bars">{[{ day: "Mon", height: "44%" }, { day: "Tue", height: "65%" }, { day: "Wed", height: "54%" }, { day: "Thu", height: "83%" }, { day: "Fri", height: "60%" }, { day: "Sat", height: "95%" }, { day: "Sun", height: "74%" }].map((bar, index) => <div key={bar.day} className="bar-column"><div className={`chart-bar ${index === 5 ? "bar-highlight" : ""}`} style={{ height: bar.height }}><span>{["₹2.1L", "₹2.8L", "₹2.5L", "₹3.4L", "₹2.7L", "₹3.8L", "₹3.1L"][index]}</span></div><small>{bar.day}</small></div>)}</div></div></div>}
        <div className="chart-foot"><span><span className="legend-mark" /> Revenue</span><span className="chart-foot-summary">{role === "Customer" ? "12 orders this month" : "Total this week"}<strong>{role === "Customer" ? "₹86,420" : "₹21.4L"}</strong></span></div>
      </section>
      <section className="surface pulse-surface"><div className="surface-head"><div><h2>{role === "Customer" ? "Recommended for you" : role === "Delivery" ? "Route snapshot" : "Stock to watch"}</h2><p>{role === "Customer" ? "Popular with businesses like yours" : "Items with lower availability"}</p></div><Button variant="ghost" size="icon" aria-label="More stock insights" onClick={() => onNavigate(role === "Customer" ? "Products" : "Products")}><Ellipsis size={18} /></Button></div><div className="catalog-teaser"><img src={catalogPhoto} alt="Wholesale groceries, household essentials and packed goods" width={1408} height={704} loading="lazy" /><span className="teaser-label">WHOLESALE ESSENTIALS</span></div><div className="stock-alert"><span className="stock-alert-mark"><ArrowDown size={15} /></span><div><strong>Dishwash Bar · Lemon</strong><span>18 cases in stock · Restock suggested</span></div><Button variant="ghost" size="icon" aria-label="View product" onClick={() => onNavigate("Products")}><ArrowRight size={16} /></Button></div><div className="stock-alert"><span className="stock-alert-mark soft"><Clock3 size={15} /></span><div><strong>Assam Tea · Strong Leaf</strong><span>42 cases in stock · 3 pending orders</span></div><Button variant="ghost" size="icon" aria-label="View product" onClick={() => onNavigate("Products")}><ArrowRight size={16} /></Button></div><Button variant="outline" className="w-full" onClick={() => onNavigate(role === "Customer" ? "Products" : "Products")}>Browse catalogue <ArrowRight size={15} /></Button></section>
    </div>
    <section className="surface recent-surface"><div className="surface-head"><div><h2>{role === "Customer" ? "Recent purchases" : role === "Delivery" ? "Upcoming stops" : role === "Salesperson" ? "Recent account orders" : "Recent orders"}</h2><p>{role === "Delivery" ? "Scheduled on your route today" : "Latest activity across your business"}</p></div><Button variant="outline" size="sm" onClick={() => onNavigate(role === "Delivery" ? "Deliveries" : "Orders")}>View all <ArrowRight size={14} /></Button></div><OrdersTable orders={ordersSeed.slice(0, 4)} compact /></section>
  </>;
}

function OrdersView({ role, orders }: { role: Role; orders: typeof ordersSeed }) {
  return <section className="surface data-surface"><div className="table-heading"><div><h2>{role === "Customer" ? "Order history" : "All orders"}</h2><p>Updated just now <span className="preview-dot" /></p></div><Button variant="ghost" size="icon" aria-label="More order options" onClick={() => toast("Order actions are preview-only until records are connected.")}><Ellipsis size={19} /></Button></div><OrdersTable orders={orders} /></section>;
}

function OrdersTable({ orders, compact = false }: { orders: typeof ordersSeed; compact?: boolean }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>ITEMS</th><th>AMOUNT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id}><td><strong className="order-id">{order.id}</strong></td><td><span className="table-primary">{order.customer}</span><span className="table-secondary">{order.city}</span></td><td>{order.date}</td><td>{order.items} items</td><td><strong>{formatMoney(order.amount)}</strong></td><td><StatusPill status={order.status} /></td><td><Button variant="ghost" size="icon" aria-label={`View ${order.id}`} onClick={() => toast(`${order.id} is illustrative preview data.`)}><ArrowRight size={15} /></Button></td></tr>) : <tr><td colSpan={7} className="empty-state">No orders match your search.</td></tr>}</tbody></table>{compact && <div className="table-mobile-note">Showing latest orders</div>}</div>;
}

function StatusPill({ status }: { status: string }) {
  const style = status === "Delivered" ? "status-green" : status === "Out for delivery" ? "status-blue" : status === "Packed" ? "status-orange" : "status-gray";
  return <span className={`status-pill ${style}`}><span />{status}</span>;
}

function ProductsView({ role, products: visibleProducts, category, onAdd }: { role: Role; products: typeof products; category: string; onAdd: () => void }) {
  const isCustomer = role === "Customer";
  return <>
    {isCustomer && <div className="catalog-banner"><img src={catalogPhoto} alt="Wholesale assortment of fresh produce, staples and household essentials" width={1408} height={704} /><div className="catalog-banner-copy"><span className="eyebrow">YOUR WHOLESALE CATALOGUE</span><strong>Everyday essentials.<br />Wholesale prices.</strong><span>Browse your business assortment and add to your next order.</span></div></div>}
    <section className="surface data-surface"><div className="table-heading"><div><h2>{isCustomer ? "Available to your business" : "Product catalogue"}</h2><p>{visibleProducts.length} products {category !== "All products" ? `in ${category}` : "across all categories"}</p></div><Button variant="outline" size="sm" onClick={() => toast("Your product export is ready (preview).")}><Download size={14} /> Export</Button></div><div className="table-scroll"><table className="data-table product-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>SKU</th><th>STOCK</th><th>WHOLESALE PRICE</th><th /></tr></thead><tbody>{visibleProducts.length ? visibleProducts.map((product) => <tr key={product.sku}><td><span className="product-cell"><span className="product-thumb"><Package size={17} /></span><span><strong className="table-primary">{product.name}</strong><span className="table-secondary">{product.pack}</span></span></span></td><td><span className="category-tag">{product.category}</span></td><td className="sku-cell">{product.sku}</td><td><span className={product.stock < 30 ? "low-stock" : "stock-count"}><span />{product.stock} {product.unit}</span></td><td><strong className="price-strong">{formatMoney(product.price)}</strong></td><td><Button variant={isCustomer ? "default" : "ghost"} size={isCustomer ? "sm" : "icon"} aria-label={isCustomer ? `Add ${product.name} to order` : `More options for ${product.name}`} onClick={() => isCustomer ? (onAdd(), toast(`${product.name} added to your preview cart.`)) : toast("Product management will be connected in a later phase.")}>{isCustomer ? <><Plus size={14} /> Add</> : <Ellipsis size={17} />}</Button></td></tr>) : <tr><td colSpan={6} className="empty-state">No products match your search.</td></tr>}</tbody></table></div></section>
  </>;
}

function CustomersView({ customers: visibleCustomers }: { customers: typeof customers }) {
  return <><div className="metrics-grid three customer-summary"><Metric label="Total accounts" value="248" icon={Users} tone={0} /><Metric label="Gold tier" value="42" icon={Building2} tone={1} /><Metric label="Outstanding" value="₹4.82L" icon={Wallet} tone={2} /></div><section className="surface data-surface"><div className="table-heading"><div><h2>All customers</h2><p>{visibleCustomers.length} accounts in your workspace</p></div><Button variant="ghost" size="icon" aria-label="Customer filters" onClick={() => toast("Showing every customer tier.")}><Filter size={17} /></Button></div><div className="table-scroll"><table className="data-table customer-table"><thead><tr><th>BUSINESS</th><th>CONTACT</th><th>LOCATION</th><th>TIER</th><th>ORDERS</th><th>LIFETIME VALUE</th><th /></tr></thead><tbody>{visibleCustomers.length ? visibleCustomers.map((customer) => <tr key={customer.name}><td><span className="customer-cell"><span className="customer-avatar">{customer.initials}</span><strong className="table-primary">{customer.name}</strong></span></td><td>{customer.contact}</td><td>{customer.location}</td><td><span className={`tier-tag tier-${customer.tier.toLowerCase()}`}>{customer.tier}</span></td><td>{customer.orders}</td><td><strong>{formatMoney(customer.spend)}</strong></td><td><Button variant="ghost" size="icon" aria-label={`View ${customer.name}`} onClick={() => toast(`${customer.name} · ${customer.orders} preview orders.`)}><ArrowRight size={15} /></Button></td></tr>) : <tr><td colSpan={7} className="empty-state">No customers match your search.</td></tr>}</tbody></table></div></section></>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: IconComponent; tone: number }) {
  return <div className="metric"><div className="metric-top"><span>{label}</span><span className={`metric-icon metric-icon-${tone}`}><Icon size={17} /></span></div><strong>{value}</strong><div className="metric-delta"><span className="metric-dot" />Live accounts · preview</div></div>;
}

function PricingView({ role, priceTier, onTierChange }: { role: Role; priceTier: string; onTierChange: (tier: string) => void }) {
  const tiers = [
    { name: "Gold", detail: "Top-volume partners", discount: "12%", accounts: 42, accent: "gold" },
    { name: "Silver", detail: "Growing businesses", discount: "8%", accounts: 86, accent: "silver" },
    { name: "Bronze", detail: "New and small shops", discount: "4%", accounts: 120, accent: "bronze" },
  ];
  const selectedDiscount = tiers.find((tier) => tier.name === priceTier)?.discount ?? "12%";
  return <>
    {role === "Customer" ? <div className="customer-price-callout"><span className="customer-price-icon"><CircleDollarSign size={20} /></span><div><small>YOUR BUSINESS TIER</small><strong>{priceTier} partner pricing <span>{selectedDiscount} OFF</span></strong><p>Prices shown include your negotiated wholesale discount.</p></div></div> : <div className="pricing-intro"><div><span className="eyebrow">CUSTOMER PRICING</span><h2>Built for long-term partnerships</h2><p>Set clear, consistent discounts for every customer group.</p></div><Button onClick={() => toast("Pricing rules will be saved when connected to live data.")}><Plus size={15} /> Create price rule</Button></div>}
    <div className="tier-grid">{tiers.map((tier) => <button key={tier.name} type="button" className={`tier-card ${priceTier === tier.name ? "tier-card-active" : ""}`} onClick={() => onTierChange(tier.name)}><div className="tier-card-top"><span className={`tier-orb ${tier.accent}`}><CircleDollarSign size={17} /></span><span className="tier-accounts">{tier.accounts} accounts</span></div><strong>{tier.name}</strong><span className="tier-detail">{tier.detail}</span><div className="tier-discount"><strong>{tier.discount}</strong><span>standard discount</span></div><div className="tier-card-foot"><span className="tier-example">Example: Basmati rice</span><strong>{formatMoney(Math.round(1840 * (1 - Number(tier.discount.replace("%", "")) / 100)))}</strong><ArrowRight size={15} /></div>{priceTier === tier.name && <span className="tier-selected"><Check size={13} /> Selected</span>}</button>)}</div>
    <section className="surface price-list-surface"><div className="table-heading"><div><h2>{role === "Customer" ? "Your wholesale prices" : `${priceTier} tier · product prices`}</h2><p>Per standard case or pack size</p></div><Button variant="outline" size="sm" onClick={() => toast("The selected price list is ready (preview).")}><Download size={14} /> Download price list</Button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>PRODUCT</th><th>PACK SIZE</th><th>LIST PRICE</th><th>YOUR PRICE</th><th>SAVING</th></tr></thead><tbody>{products.slice(0, 5).map((product) => { const rawDiscount = Number(selectedDiscount.replace("%", "")); const finalPrice = Math.round(product.price * (1 - rawDiscount / 100)); return <tr key={product.sku}><td><strong className="table-primary">{product.name}</strong></td><td>{product.pack}</td><td className="list-price">{formatMoney(product.price)}</td><td><strong className="price-strong">{formatMoney(finalPrice)}</strong></td><td><span className="saving-tag">Save {formatMoney(product.price - finalPrice)}</span></td></tr>; })}</tbody></table></div></section>
  </>;
}

function DeliveriesView({ delivered, onMarkDelivered }: { delivered: string[]; onMarkDelivered: (id: string) => void }) {
  const stops = [
    { id: "VD-2847", customer: "Fresh Fields Market", address: "18 Linking Road, Bandra West", time: "10:30 – 11:00", items: 24, amount: 32750, state: "Out for delivery" },
    { id: "VD-2848", customer: "Mehta General Mart", address: "42 FC Road, Shivajinagar", time: "11:30 – 12:00", items: 12, amount: 16400, state: "Packed" },
    { id: "VD-2849", customer: "Green Basket Stores", address: "7 Aundh Road, Aundh", time: "12:30 – 13:00", items: 18, amount: 24850, state: "Processing" },
    { id: "VD-2846", customer: "Shree Provision Co.", address: "12 JM Road, Deccan Gymkhana", time: "14:00 – 14:30", items: 9, amount: 11820, state: "Packed" },
  ];
  const completed = delivered.length + 4;
  return <><div className="metrics-grid three"><Metric label="Stops completed" value={`${completed} of 12`} icon={Check} tone={1} /><Metric label="Packages on route" value="28" icon={Package} tone={2} /><Metric label="Next delivery" value="11:30 am" icon={Clock3} tone={3} /></div><section className="surface data-surface delivery-surface"><div className="table-heading"><div><h2>Scheduled stops</h2><p><CalendarDays size={14} /> Tuesday, 10 November · Pune West</p></div><span className="route-summary-pill"><Truck size={15} /> Van MH 12 AB 4821</span></div><div className="delivery-list">{stops.map((stop, index) => { const isDone = delivered.includes(stop.id); return <div className={`delivery-stop ${isDone ? "delivery-complete" : ""}`} key={stop.id}><div className="stop-timeline"><span className="stop-number">{isDone ? <Check size={15} /> : index + 1}</span>{index < stops.length - 1 && <span className="stop-line" />}</div><div className="stop-time">{stop.time.split(" – ")[0]}<small>{stop.time.split(" – ")[1]}</small></div><div className="stop-content"><div className="stop-content-top"><div><strong>{stop.customer}</strong><span>{stop.address}</span></div><StatusPill status={isDone ? "Delivered" : stop.state} /></div><div className="stop-details"><span>{stop.items} items</span><span>·</span><span>{formatMoney(stop.amount)}</span><span className="stop-order-id">{stop.id}</span></div></div><Button variant={isDone ? "outline" : "secondary"} size="sm" disabled={isDone} onClick={() => { onMarkDelivered(stop.id); toast(`${stop.customer} marked delivered (preview).`); }}>{isDone ? <><Check size={14} /> Delivered</> : "Mark delivered"}</Button></div>; })}</div></section></>;
}