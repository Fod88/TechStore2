# TechStore Frontend

React + Vite storefront and admin dashboard, built against the TechStore backend
(Express 5, MongoDB/Mongoose, JWT).

## Run it

```bash
# 1) backend (in the backend folder)
npm install && npm run dev        # http://localhost:3000

# 2) frontend
npm install
cp .env.example .env              # VITE_API_BASE_URL=http://localhost:3000
npm run dev                       # http://localhost:5173
```

The backend enables CORS with `cors()`, so no proxy is needed. In production, set
`VITE_API_BASE_URL` to your deployed API and restrict CORS to your frontend origin.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | no | `http://localhost:3000` | Backend base URL (routes have no `/api` prefix) |
| `VITE_CURRENCY` | no | `USD` | ISO currency code for prices |
| `VITE_LOCALE` | no | `en-US` | Number/date formatting locale |

## How the frontend maps to the backend

| Feature | Request | Notes handled by the frontend |
| --- | --- | --- |
| Login | `POST /users/login` `{email,password}` | Email lower-cased. Returns `{user:{id,...}, token}` |
| Register | `POST /users/register` `{name,email,password}` | Returns the user but **no token**, so the app signs in right after |
| Products | `GET /products?search&category&minPrice&maxPrice&sort` | Public. Backend rejects unknown params, so only these are sent. `search` is regex-escaped (backend uses `$regex`) |
| Product | `GET /products/:id` | Public. 404 for deactivated products |
| Categories | `GET /categories` | Public, active only |
| Cart | `GET /cart` → `{cart:{items:[{productId:{…product}, quantity}]}, totalPrice}` | Only GET is populated. POST/PATCH/DELETE return bare ids, so the app re-reads `GET /cart` after each change. 404 = empty cart |
| Add to cart | `POST /cart/items` `{productId, quantity}` | Creates the cart if missing. Errors like insufficient stock are shown as toasts |
| Order | `POST /orders` `{shippingAddress:{city,street,phone}}` | Cart lines that are deactivated / over stock are flagged and block checkout |
| My orders | `GET /orders`, `GET /orders/:id` | Items carry `productName` (no image), so thumbnails are looked up per product |
| Admin | `GET /admin/dashboard`, `/admin/users`, `/admin/orders`, `PATCH /admin/orders/:id/status {status}` | Orders only carry `userId`, so the app joins them with `/admin/users` to show customer name and email |
| Admin catalog | `POST/PATCH/DELETE /products`, `/categories` | Edits send only changed fields. DELETE is a soft delete |
| Product image | `POST/PATCH /products` with `upload.single('image')` (Cloudinary) | The admin picks a real file (JPG/PNG/WEBP, ≤5 MB); it's sent as `multipart/form-data`. **Important:** the backend's allow-list for both routes checks `Object.keys(req.body)` and does not include `"image"`, so an image URL sent as a plain field is rejected with `"Invalid fields"`. Only an uploaded file works, because multer removes it from `req.body` into `req.file` before that check runs. There's no way to *clear* an existing image — only replace it with a new upload |

Errors: the backend replies `{ error: "..." }` (and once `{ errorr: "..." }`); both are surfaced.

## Structure

```
src/
├── components/  ui/ · store/ · admin/
├── context/     AuthContext, CartContext, ToastContext
├── hooks/       useFetch, useDebounce, useCategories, useAddToCart, useOrderProducts, useDocumentTitle
├── layouts/     StoreLayout, AuthLayout, AdminLayout
├── pages/       customer pages + admin/
├── routes/      AppRoutes (lazy admin bundle), guards
├── services/    api.js (axios + interceptors) + one service per resource
├── styles/      base (tokens) · components · store · admin
└── utils/       session, normalize, format, constants
```
