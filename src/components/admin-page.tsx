"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings2,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { formatPrice } from "@/lib/cart";

type Category = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  sortOrder: number;
  _count?: { products: number };
};
type Variant = {
  id?: string;
  name: string;
  colorHex: string;
  imageUrl?: string | null;
  stock: number;
  enabled: boolean;
};
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  height: string;
  imageUrl: string;
  gallery: string;
  attributes: string;
  featured: boolean;
  enabled: boolean;
  categoryId: string;
  category: Category;
  variants: Variant[];
};
type Order = {
  id: string;
  publicId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items: { productName: string; variantName: string; quantity: number }[];
};
type ContentRecord = {
  brand?: Record<string, string>;
  hero?: Record<string, string>;
  contact?: Record<string, string>;
  footer?: Record<string, string>;
};

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Settings2 },
  { id: "homepage", label: "Homepage & content", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: ChevronRight },
];

const blankProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  stock: 0,
  height: "",
  imageUrl: "",
  gallery: "[]",
  attributes: "{}",
  featured: false,
  enabled: true,
  categoryId: "",
  variantsText: "Ivory|#E8DCC4|5\nVermilion|#B84D36|5",
};

const variantColorOptions = [
  ["Ivory", "#E8DCC4"],
  ["Vermilion", "#B84D36"],
  ["Saffron", "#CB7950"],
  ["Rose", "#C78382"],
  ["Gold", "#B79A5D"],
  ["Leaf", "#637655"],
  ["Classic", "#AF7442"],
  ["Black", "#292B27"],
  ["White", "#FFFFFF"],
  ["Blue", "#66839A"],
  ["Pink", "#D69BA3"],
  ["Purple", "#87718E"],
  ["Orange", "#D4773E"],
  ["Yellow", "#D5B04D"],
  ["Green", "#637655"],
] as const;

function updateVariantColor(variantsText: string, index: number, colorHex: string) {
  return variantsText
    .split("\n")
    .map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      const parts = line.split("|");
      parts[1] = colorHex;
      return parts.join("|");
    })
    .join("\n");
}

function galleryFieldValue(gallery: string) {
  try {
    const urls = JSON.parse(gallery || "[]");
    return Array.isArray(urls) ? urls.join("\n") : "";
  } catch {
    return gallery;
  }
}

async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? "Request failed");
  return result;
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error ?? "Could not upload image");
  return result.url as string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState("overview");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [content, setContent] = useState<ContentRecord>({});
  const [sections, setSections] = useState<
    {
      id: string;
      type: string;
      heading: string;
      description: string;
      imageUrl: string;
      productIds: string;
      enabled: boolean;
      sortOrder: number;
    }[]
  >([]);
  const [newSectionHeading, setNewSectionHeading] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(blankProduct);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryForm, setEditingCategoryForm] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    api("/api/admin/session")
      .then((result) => setAuthenticated(result.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  async function loadAdmin() {
    setLoading(true);
    try {
      const [productList, categoryList, orderList, contentData] =
        await Promise.all([
          api("/api/admin/products"),
          api("/api/admin/categories"),
          api("/api/admin/orders"),
          api("/api/admin/content"),
        ]);
      setProducts(productList);
      setCategories(categoryList);
      setOrders(orderList);
      setContent(contentData.content);
      setSections(contentData.sections);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load studio data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) void Promise.resolve().then(loadAdmin);
  }, [authenticated]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/admin/session", "POST", { email, password });
      setAuthenticated(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in");
    }
  }

  async function logout() {
    await api("/api/admin/session", "DELETE").catch(() => undefined);
    setAuthenticated(false);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isEditingProduct = Boolean(editingProduct && editingProduct !== "new");
    const variants = productForm.variantsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, colorHex, stock, imageUrl, enabled = "true"] = line
          .split("|")
          .map((part) => part.trim());
        return {
          name,
          colorHex: colorHex || "#B96546",
          stock: Number(stock || 0),
          ...(imageUrl ? { imageUrl } : {}),
          enabled: enabled !== "false",
        };
      });
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.slug || slugify(productForm.name),
        description: productForm.description,
        price: Math.round(Number(productForm.price) * 100),
        stock: Number(productForm.stock),
        height: productForm.height,
        imageUrl: productForm.imageUrl,
        gallery: productForm.gallery
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        attributes: JSON.parse(productForm.attributes || "{}"),
        featured: productForm.featured,
        enabled: productForm.enabled,
        categoryId: productForm.categoryId,
        variants,
      };
      await api(
        isEditingProduct
          ? `/api/admin/products/${editingProduct}`
          : "/api/admin/products",
        isEditingProduct ? "PATCH" : "POST",
        payload,
      );
      setEditingProduct(null);
      setProductForm(blankProduct);
      setMessage("Product saved.");
      await loadAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save product",
      );
    }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/admin/categories", "POST", {
        ...categoryForm,
        slug: categoryForm.slug || slugify(categoryForm.name),
        enabled: true,
        sortOrder: categories.length,
      });
      setCategoryForm({ name: "", slug: "" });
      setMessage("Category added.");
      await loadAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add category",
      );
    }
  }

  async function updateCategory(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    try {
      await api(`/api/admin/categories/${id}`, "PATCH", {
        ...editingCategoryForm,
        slug: editingCategoryForm.slug || slugify(editingCategoryForm.name),
      });
      setEditingCategory(null);
      await loadAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update category",
      );
    }
  }

  async function moveCategory(index: number, direction: -1 | 1) {
    const current = categories[index];
    const neighbor = categories[index + direction];
    if (!current || !neighbor) return;
    try {
      const temporaryOrder = Math.max(current.sortOrder, neighbor.sortOrder) + categories.length + 1;
      await api(`/api/admin/categories/${current.id}`, "PATCH", {
        sortOrder: temporaryOrder,
      });
      await api(`/api/admin/categories/${neighbor.id}`, "PATCH", {
        sortOrder: current.sortOrder,
      });
      await api(`/api/admin/categories/${current.id}`, "PATCH", {
        sortOrder: neighbor.sortOrder,
      });
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reorder categories");
    }
  }

  async function saveContent(
    event: FormEvent<HTMLFormElement>,
    key: "brand" | "hero" | "contact" | "footer",
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = Object.fromEntries(form.entries());
    try {
      await api("/api/admin/content", "PUT", { key, value: next });
      setContent((current) => ({ ...current, [key]: next }));
      setMessage("Studio details saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save content",
      );
    }
  }

  async function updateSection(
    section: (typeof sections)[number],
    changes: Partial<(typeof sections)[number]>,
  ) {
    try {
      await api("/api/admin/content", "PATCH", {
        ...section,
        ...changes,
        productIds: JSON.parse(section.productIds || "[]"),
      });
      await loadAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save section",
      );
    }
  }

  async function saveSection(
    event: FormEvent<HTMLFormElement>,
    section: (typeof sections)[number],
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateSection(section, {
      heading: String(form.get("heading") ?? ""),
      description: String(form.get("description") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? ""),
    });
    setMessage("Homepage section saved.");
  }

  async function createSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api("/api/admin/content", "PATCH", {
        type: "promotion",
        heading: newSectionHeading,
        description: "",
        imageUrl: "",
        productIds: [],
        enabled: true,
        sortOrder: sections.length + 1,
      });
      setNewSectionHeading("");
      await loadAdmin();
      setMessage("Homepage section added.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add section",
      );
    }
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const current = sections[index];
    const neighbor = sections[index + direction];
    if (!current || !neighbor) return;
    try {
      const temporaryOrder = Math.max(current.sortOrder, neighbor.sortOrder) + sections.length + 1;
      await api("/api/admin/content", "PATCH", {
        ...current,
        productIds: JSON.parse(current.productIds || "[]"),
        sortOrder: temporaryOrder,
      });
      await api("/api/admin/content", "PATCH", {
        ...neighbor,
        productIds: JSON.parse(neighbor.productIds || "[]"),
        sortOrder: current.sortOrder,
      });
      await api("/api/admin/content", "PATCH", {
        ...current,
        productIds: JSON.parse(current.productIds || "[]"),
        sortOrder: neighbor.sortOrder,
      });
      await loadAdmin();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not reorder sections",
      );
    }
  }

  if (authenticated === null)
    return <main className="admin-loading">Opening the studio…</main>;
  if (!authenticated)
    return (
      <main className="admin-login-page">
        <Link className="admin-logo" href="/">
          m{" "}
          <span>
            MORYA HOUSE <small>STUDIO ADMIN</small>
          </span>
        </Link>
        <form className="admin-login-form" onSubmit={login}>
          <span className="overline">Private studio</span>
          <h1>Welcome back.</h1>
          <p>Sign in to manage your collection, content and orders.</p>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {message && (
            <div className="form-error" role="alert">
              {message}
            </div>
          )}
          <button className="button button-dark" type="submit">
            Sign in <ChevronRight size={16} />
          </button>
          <Link href="/" className="admin-back-link">
            Return to Morya House <ExternalLink size={13} />
          </Link>
        </form>
        <div className="admin-login-side">
          <span>श्री</span>
          <p>
            Every piece has a story.
            <br />
            Here&apos;s where yours begins.
          </p>
        </div>
      </main>
    );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">
          m{" "}
          <span>
            MORYA HOUSE <small>STUDIO ADMIN</small>
          </span>
        </Link>
        <span className="admin-nav-label">WORKSPACE</span>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? "admin-nav-active" : ""}
              onClick={() => {
                setTab(id);
                setMessage("");
              }}
            >
              <Icon size={17} />
              {label}
              {tab === id && <i />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-status-dot" /> Your studio is live{" "}
          <button onClick={logout} aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="overline">MORYA HOUSE / STUDIO</span>
            <h1>{navItems.find((item) => item.id === tab)?.label}</h1>
          </div>
          <div className="admin-top-actions">
            <Link href="/" target="_blank" rel="noreferrer">
              View website <ExternalLink size={14} />
            </Link>
            <button className="admin-avatar" onClick={logout}>
              MH
            </button>
          </div>
        </header>
        {message && (
          <div className="admin-message" role="status">
            <CircleAlert size={16} />
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}
        {loading && <div className="admin-load-line" />}

        {tab === "overview" && (
          <div className="admin-content">
            <div className="admin-welcome">
              <div>
                <span className="overline">YOUR ATELIER, AT A GLANCE</span>
                <h2>
                  Good things are
                  <br />
                  <em>taking shape.</em>
                </h2>
                <p>A considered collection, managed with care.</p>
              </div>
              <span className="admin-welcome-mark">श्री</span>
            </div>
            <div className="admin-stats">
              <article>
                <span>ACTIVE PIECES</span>
                <b>
                  {products
                    .filter((item) => item.enabled)
                    .length.toString()
                    .padStart(2, "0")}
                </b>
                <small>
                  Across {categories.filter((item) => item.enabled).length}{" "}
                  active categories
                </small>
              </article>
              <article>
                <span>ORDERS TO FULFIL</span>
                <b>
                  {orders
                    .filter(
                      (item) =>
                        !["delivered", "cancelled"].includes(item.status),
                    )
                    .length.toString()
                    .padStart(2, "0")}
                </b>
                <small>From the studio counter</small>
              </article>
              <article>
                <span>PAID ORDERS</span>
                <b>
                  {orders
                    .filter((item) => item.paymentStatus === "paid")
                    .length.toString()
                    .padStart(2, "0")}
                </b>
                <small>Verified via payment provider</small>
              </article>
              <article>
                <span>FEATURED PIECES</span>
                <b>
                  {products
                    .filter((item) => item.featured && item.enabled)
                    .length.toString()
                    .padStart(2, "0")}
                </b>
                <small>Shown on your homepage</small>
              </article>
            </div>
            <div className="admin-overview-lower">
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="overline">RECENT ACTIVITY</span>
                    <h3>Latest orders</h3>
                  </div>
                  <button onClick={() => setTab("orders")}>
                    All orders <ChevronRight size={14} />
                  </button>
                </div>
                {orders.length ? (
                  orders.slice(0, 4).map((order) => (
                    <div className="admin-recent-row" key={order.id}>
                      <span className="order-bullet">
                        {order.customerName.slice(0, 1)}
                      </span>
                      <div>
                        <b>{order.customerName}</b>
                        <small>
                          {order.publicId} ·{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </small>
                      </div>
                      <strong>{formatPrice(order.total)}</strong>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="admin-blank">
                    Your orders will appear here.
                  </div>
                )}
              </section>
              <section className="admin-panel quick-panel">
                <span className="overline">QUICK ACTIONS</span>
                <h3>Make it yours.</h3>
                <button
                  onClick={() => {
                    setTab("products");
                    setEditingProduct("new");
                    setProductForm(blankProduct);
                  }}
                >
                  <Plus size={15} /> Add a new piece <ChevronRight size={15} />
                </button>
                <button onClick={() => setTab("categories")}>
                  <Settings2 size={15} /> Manage categories{" "}
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => setTab("homepage")}>
                  <ShoppingBag size={15} /> Edit your homepage{" "}
                  <ChevronRight size={15} />
                </button>
              </section>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <div>
                <span className="overline">YOUR CATALOGUE</span>
                <h2>Every piece, thoughtfully listed.</h2>
              </div>
              <button
                className="button button-dark"
                onClick={() => {
                  setEditingProduct("new");
                  setProductForm({
                    ...blankProduct,
                    categoryId: categories[0]?.id ?? "",
                  });
                }}
              >
                {" "}
                <Plus size={16} /> Add a piece
              </button>
            </div>
            {editingProduct && (
              <form className="admin-editor" onSubmit={saveProduct}>
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">
                      {editingProduct === "new" ? "NEW PIECE" : "EDIT PIECE"}
                    </span>
                    <h3>
                      {editingProduct === "new"
                        ? "Add to your collection"
                        : productForm.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="admin-close"
                    onClick={() => setEditingProduct(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="admin-form-grid">
                  <label>
                    Product name
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          name: event.target.value,
                          ...(editingProduct === "new"
                            ? { slug: slugify(event.target.value) }
                            : {}),
                        })
                      }
                    />
                  </label>
                  <label>
                    Price (INR)
                    <input
                      type="number"
                      min="1"
                      required
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          price: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stock}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          stock: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Height / size
                    <input
                      value={productForm.height}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          height: event.target.value,
                        })
                      }
                      placeholder="6 inches"
                    />
                  </label>
                  <label>
                    Category
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          categoryId: event.target.value,
                        })
                      }
                    >
                      <option value="">Choose category</option>
                      {categories.map((category) => (
                        <option value={category.id} key={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field-wide">
                    Main image
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" required={!productForm.imageUrl} onChange={async (event) => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; try { const imageUrl = await uploadImage(file); setProductForm({ ...productForm, imageUrl }); setMessage("Main image uploaded."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload image"); } input.value = ""; }} />
                    <small className="admin-uploaded-file">{productForm.imageUrl || "Choose an image from your computer"}</small>
                  </label>
                  <label>
                    Gallery images
                    <textarea
                      rows={3}
                      value={productForm.gallery}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          gallery: event.target.value,
                        })
                      }
                      placeholder="Uploaded gallery images appear here"
                    />
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={async (event) => { const input = event.currentTarget; const files = Array.from(input.files ?? []); if (!files.length) return; try { const urls = await Promise.all(files.map(uploadImage)); setProductForm({ ...productForm, gallery: [...productForm.gallery.split("\n").filter(Boolean), ...urls].join("\n") }); setMessage("Gallery images uploaded."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload gallery images"); } input.value = ""; }} />
                  </label>
                  <label className="admin-field-wide">
                    Description
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="admin-field-wide variant-color-editor">
                    <span className="admin-field-label">Variant colors</span>
                    <small>Choose from the full color palette for each finish.</small>
                    {productForm.variantsText.split("\n").map((line, index) => {
                      const [name = "Unnamed finish", colorHex = "#B96546", stock = "0"] = line.split("|");
                      const hasPreset = variantColorOptions.some(([, value]) => value === colorHex);
                      return (
                        <div className="variant-color-row" key={`${name}-${index}`}>
                          <span><b>{name.trim()}</b><small>{stock.trim()} in stock</small></span>
                          <select
                            aria-label={`Color for ${name.trim()}`}
                            value={hasPreset ? colorHex : "custom"}
                            onChange={(event) => {
                              if (event.target.value !== "custom") {
                                setProductForm({
                                  ...productForm,
                                  variantsText: updateVariantColor(productForm.variantsText, index, event.target.value),
                                });
                              }
                            }}
                          >
                            <option value="custom">Current color</option>
                            {variantColorOptions.map(([label, value]) => (
                              <option value={value} key={`${label}-${value}`}>{label}</option>
                            ))}
                          </select>
                          <i style={{ backgroundColor: colorHex.trim() }} aria-hidden="true" />
                        </div>
                      );
                    })}
                  </div>
                  <label className="admin-field-wide">
                    Extra attributes (JSON)
                    <textarea
                      rows={2}
                      value={productForm.attributes}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          attributes: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          featured: event.target.checked,
                        })
                      }
                    />{" "}
                    Feature on homepage
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={productForm.enabled}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          enabled: event.target.checked,
                        })
                      }
                    />{" "}
                    Visible in store
                  </label>
                </div>
                <button className="button button-dark" type="submit">
                  Save piece <Check size={15} />
                </button>
              </form>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PIECE</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-name">
                          <span
                            className="admin-product-thumb"
                            style={{
                              backgroundImage: `url("${product.imageUrl}")`,
                            }}
                          />
                          <span>
                            <b>{product.name}</b>
                            <small>
                              {product.height || product.slug}
                              {product.featured ? " · Featured" : ""}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>{product.category?.name}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button
                          className={`status-pill ${product.enabled ? "status-delivered" : "status-cancelled"}`}
                          onClick={async () => {
                            await api(
                              `/api/admin/products/${product.id}`,
                              "PATCH",
                              { enabled: !product.enabled },
                            );
                            await loadAdmin();
                          }}
                        >
                          {product.enabled ? "Live" : "Hidden"}
                        </button>
                      </td>
                      <td>
                        <button
                          className="table-action"
                          onClick={() => {
                            setEditingProduct(product.id);
                            setProductForm({
                              ...product,
                              price: product.price / 100,
                              gallery: galleryFieldValue(product.gallery),
                              variantsText: product.variants
                                .map(
                                  (variant) =>
                                    `${variant.name}|${variant.colorHex}|${variant.stock}|${variant.imageUrl ?? ""}|${variant.enabled}`,
                                )
                                .join("\n"),
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="table-icon-action"
                          aria-label={`Delete ${product.name}`}
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Remove ${product.name} from the store?`,
                              )
                            ) {
                              await api(
                                `/api/admin/products/${product.id}`,
                                "DELETE",
                              );
                              await loadAdmin();
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="admin-blank">
                  No products yet. Add the first piece above.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <div>
                <span className="overline">MATERIALS & COLLECTIONS</span>
                <h2>A category for every kind of meaning.</h2>
              </div>
            </div>
            <form className="admin-inline-create" onSubmit={saveCategory}>
              <label>
                Category name
                <input
                  required
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm({
                      name: event.target.value,
                      slug: categoryForm.slug || slugify(event.target.value),
                    })
                  }
                  placeholder="e.g. Shadu Mati"
                />
              </label>
              <label>
                URL slug
                <input
                  required
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      slug: event.target.value,
                    })
                  }
                  placeholder="shadu-mati"
                />
              </label>
              <button className="button button-dark">
                <Plus size={16} /> Add category
              </button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CATEGORY</th>
                    <th>URL SLUG</th>
                    <th>PIECES</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {editingCategory === category.id ? (
                          <form
                            className="category-edit-form"
                            onSubmit={(event) =>
                              updateCategory(event, category.id)
                            }
                          >
                            <input
                              value={editingCategoryForm.name}
                              onChange={(event) =>
                                setEditingCategoryForm({
                                  ...editingCategoryForm,
                                  name: event.target.value,
                                })
                              }
                              required
                            />
                            <button className="table-action">Save</button>
                          </form>
                        ) : (
                          <b>{category.name}</b>
                        )}
                      </td>
                      <td>
                        {editingCategory === category.id ? (
                          <input
                            value={editingCategoryForm.slug}
                            onChange={(event) =>
                              setEditingCategoryForm({
                                ...editingCategoryForm,
                                slug: event.target.value,
                              })
                            }
                            required
                          />
                        ) : (
                          <span className="admin-slug">/{category.slug}</span>
                        )}
                      </td>
                      <td>{category._count?.products ?? 0}</td>
                      <td>
                        <button
                          className={`status-pill ${category.enabled ? "status-delivered" : "status-cancelled"}`}
                          onClick={async () => {
                            await api(
                              `/api/admin/categories/${category.id}`,
                              "PATCH",
                              { enabled: !category.enabled },
                            );
                            await loadAdmin();
                          }}
                        >
                          {category.enabled ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td>
                        {editingCategory === category.id ? (
                          <button
                            className="table-action"
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <>
                            <button
                              className="table-icon-action"
                              aria-label={`Move ${category.name} up`}
                              disabled={categories.indexOf(category) === 0}
                              onClick={() =>
                                void moveCategory(categories.indexOf(category), -1)
                              }
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              className="table-icon-action"
                              aria-label={`Move ${category.name} down`}
                              disabled={categories.indexOf(category) === categories.length - 1}
                              onClick={() =>
                                void moveCategory(categories.indexOf(category), 1)
                              }
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              className="table-action"
                              onClick={() => {
                                setEditingCategory(category.id);
                                setEditingCategoryForm({
                                  name: category.name,
                                  slug: category.slug,
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="table-icon-action"
                              onClick={async () => {
                                if (
                                  window.confirm(`Delete ${category.name}?`)
                                ) {
                                  try {
                                    await api(
                                      `/api/admin/categories/${category.id}`,
                                      "DELETE",
                                    );
                                    await loadAdmin();
                                  } catch (error) {
                                    setMessage(
                                      error instanceof Error
                                        ? error.message
                                        : "Could not delete category",
                                    );
                                  }
                                }
                              }}
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-tip">
              <CircleAlert size={16} /> Categories with products cannot be
              deleted. Hide the category or move its products first.
            </div>
          </div>
        )}

        {tab === "homepage" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <div>
                <span className="overline">YOUR VOICE, YOUR SPACE</span>
                <h2>Shape the feeling of your homepage.</h2>
                <p>Every change here updates the customer website directly.</p>
              </div>
            </div>
            <div className="admin-content-grid">
              <form
                key={`hero-${JSON.stringify(content.hero ?? {})}`}
                className="admin-editor content-editor"
                onSubmit={(event) => saveContent(event, "hero")}
              >
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">FIRST IMPRESSION</span>
                    <h3>Homepage hero</h3>
                  </div>
                </div>
                <label>
                  Small introduction
                  <input
                    name="eyebrow"
                    defaultValue={content.hero?.eyebrow ?? ""}
                    required
                  />
                </label>
                <label>
                  Main heading <small>Use a line break for a new line</small>
                  <textarea
                    name="heading"
                    rows={2}
                    defaultValue={content.hero?.heading ?? ""}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={content.hero?.description ?? ""}
                    required
                  />
                </label>
                <label>
                  Hero image URL
                  <input
                    name="imageUrl"
                    defaultValue={content.hero?.imageUrl ?? ""}
                    required
                  />
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={async (event) => { const input = event.currentTarget; const form = input.form; const file = input.files?.[0]; if (!file) return; try { const imageUrl = await uploadImage(file); const field = form?.elements.namedItem("imageUrl") as HTMLInputElement | null; if (field) field.value = imageUrl; setMessage("Hero image uploaded."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload image"); } input.value = ""; }} />
                </label>
                <label>
                  Button label
                  <input
                    name="cta"
                    defaultValue={content.hero?.cta ?? ""}
                    required
                  />
                </label>
                <button className="button button-dark">
                  Save hero <Check size={15} />
                </button>
              </form>
              <form
                key={`contact-${JSON.stringify(content.contact ?? {})}`}
                className="admin-editor content-editor"
                onSubmit={(event) => saveContent(event, "contact")}
              >
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">THE HUMAN DETAILS</span>
                    <h3>Contact & studio</h3>
                  </div>
                </div>
                <label>
                  Business name
                  <input
                    name="businessName"
                    defaultValue={content.contact?.businessName ?? ""}
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    defaultValue={content.contact?.phone ?? ""}
                  />
                </label>
                <label>
                  WhatsApp number
                  <input
                    name="whatsapp"
                    defaultValue={content.contact?.whatsapp ?? ""}
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    defaultValue={content.contact?.email ?? ""}
                  />
                </label>
                <label>
                  Address
                  <input
                    name="address"
                    defaultValue={content.contact?.address ?? ""}
                  />
                </label>
                <label>
                  Google Maps URL
                  <input
                    name="mapsUrl"
                    type="url"
                    defaultValue={content.contact?.mapsUrl ?? ""}
                  />
                </label>
                <label>
                  Instagram URL
                  <input
                    name="instagram"
                    type="url"
                    defaultValue={content.contact?.instagram ?? ""}
                  />
                </label>
                <label>
                  Business hours
                  <input
                    name="hours"
                    defaultValue={content.contact?.hours ?? ""}
                  />
                </label>
                <button className="button button-dark">
                  Save contact details <Check size={15} />
                </button>
              </form>
              <form
                key={`brand-${JSON.stringify(content.brand ?? {})}`}
                className="admin-editor content-editor"
                onSubmit={(event) => saveContent(event, "brand")}
              >
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">YOUR SIGNATURE</span>
                    <h3>Brand details</h3>
                  </div>
                </div>
                <label>
                  Business name
                  <input
                    name="name"
                    defaultValue={content.brand?.name ?? ""}
                    required
                  />
                </label>
                <label>
                  Short tagline
                  <input
                    name="tagline"
                    defaultValue={content.brand?.tagline ?? ""}
                  />
                </label>
                <button className="button button-dark">
                  Save brand <Check size={15} />
                </button>
              </form>
              <form
                key={`footer-${JSON.stringify(content.footer ?? {})}`}
                className="admin-editor content-editor"
                onSubmit={(event) => saveContent(event, "footer")}
              >
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">THE LAST WORD</span>
                    <h3>Footer content</h3>
                  </div>
                </div>
                <label>
                  Studio note
                  <input name="note" defaultValue={content.footer?.note ?? ""} />
                </label>
                <label>
                  Copyright name
                  <input name="copyright" defaultValue={content.footer?.copyright ?? ""} />
                </label>
                <label>
                  Location line
                  <input name="location" defaultValue={content.footer?.location ?? ""} />
                </label>
                <label>
                  Delivery note
                  <input name="deliveryNote" defaultValue={content.footer?.deliveryNote ?? ""} />
                </label>
                <button className="button button-dark">
                  Save footer <Check size={15} />
                </button>
              </form>
              <section className="admin-editor content-editor">
                <div className="admin-editor-heading">
                  <div>
                    <span className="overline">LAYOUT & VISIBILITY</span>
                    <h3>Homepage sections</h3>
                  </div>
                </div>
                {sections.map((section, index) => (
                  <form
                    className="section-config-row section-config-editor"
                    key={section.id}
                    onSubmit={(event) => saveSection(event, section)}
                  >
                    <div className="section-config-fields">
                      <input name="heading" defaultValue={section.heading} required aria-label="Section heading" />
                      <input name="description" defaultValue={section.description} aria-label="Section description" />
                      <input name="imageUrl" defaultValue={section.imageUrl} placeholder="Optional image path" aria-label="Section image path" />
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={async (event) => { const input = event.currentTarget; const form = input.form; const file = input.files?.[0]; if (!file) return; try { const imageUrl = await uploadImage(file); const field = form?.elements.namedItem("imageUrl") as HTMLInputElement | null; if (field) field.value = imageUrl; setMessage("Section image uploaded."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload image"); } input.value = ""; }} />
                      <small>{section.type} section · position {section.sortOrder}</small>
                    </div>
                    <div className="section-config-actions">
                      <button type="submit" className="section-save">Save</button>
                      <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => void moveSection(index, -1)}><ArrowUp size={14} /></button>
                      <button type="button" aria-label="Move down" disabled={index === sections.length - 1} onClick={() => void moveSection(index, 1)}><ArrowDown size={14} /></button>
                      <button type="button" className={`section-toggle ${section.enabled ? "toggle-on" : ""}`} onClick={() => updateSection(section, { enabled: !section.enabled })}>{section.enabled ? "Visible" : "Hidden"}</button>
                    </div>
                  </form>
                ))}
                <form className="new-section-form" onSubmit={createSection}>
                  <input value={newSectionHeading} onChange={(event) => setNewSectionHeading(event.target.value)} placeholder="New promotion section heading" required minLength={2} />
                  <button className="button button-dark"><Plus size={14} /> Add homepage section</button>
                </form>
              </section>
            </div>
            <p className="admin-tip">
              <CircleAlert size={16} /> Images are stored locally in the
              public/uploads folder. Use persistent storage before deploying
              to a serverless host.
            </p>
          </div>
        )}

        {tab === "orders" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <div>
                <span className="overline">ORDERS FROM YOUR CUSTOMERS</span>
                <h2>Handled with care, from here.</h2>
              </div>
              <span className="orders-total-count">
                {orders.length} TOTAL ORDERS
              </span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table orders-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>DELIVERY</th>
                    <th>PIECES</th>
                    <th>TOTAL</th>
                    <th>PAYMENT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <b>{order.publicId}</b>
                        <small>
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </small>
                      </td>
                      <td>
                        <b>{order.customerName}</b>
                        <small>
                          {order.phone} · {order.city}, {order.state}
                        </small>
                        <small>
                          {order.address}, {order.pincode}
                        </small>
                      </td>
                      <td>
                        {order.items.map((item, index) => (
                          <small key={index}>
                            {item.quantity} × {item.productName}
                            {item.variantName ? ` · ${item.variantName}` : ""}
                          </small>
                        ))}
                      </td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span
                          className={`status-pill ${order.paymentStatus === "paid" ? "status-delivered" : "status-pending"}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={async (event) => {
                            try {
                              await api("/api/admin/orders", "PATCH", {
                                id: order.id,
                                status: event.target.value,
                              });
                              await loadAdmin();
                            } catch (error) {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Could not update order",
                              );
                            }
                          }}
                          aria-label={`Update order ${order.publicId} status`}
                        >
                          {[
                            "pending",
                            "confirmed",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="admin-blank">
                  No orders yet. Your first order will show up here.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
