import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Landing from './pages/Landing.jsx';
import ThankYou from './pages/ThankYou.jsx';
import NotFound from './pages/NotFound.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentFailed from './pages/PaymentFailed.jsx';
import Payout from './pages/Payout.jsx';
import PayoutCheck from './pages/PayoutCheck.jsx';
import OrderBill from './pages/OrderBill.jsx';
import OrderQuote from './pages/OrderQuote.jsx';
import Showcase from './pages/Showcase.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductsAdmin from './pages/admin/ProductsAdmin.jsx';
import BlogsAdmin from './pages/admin/BlogsAdmin.jsx';
import OrdersAdmin from './pages/admin/OrdersAdmin.jsx';
import DemandOrdersAdmin from './pages/admin/DemandOrdersAdmin.jsx';
import ContactsAdmin from './pages/admin/ContactsAdmin.jsx';
import DeliveryChargesAdmin from './pages/admin/DeliveryChargesAdmin.jsx';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin.jsx';
import ClientLogosAdmin from './pages/admin/ClientLogosAdmin.jsx';

export default function App() {
  return (
    <Routes>
      {/* Main public site — wrapped in the site header/footer Layout */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="landing" element={<Landing />} />
        <Route path="thank-you" element={<ThankYou />} />
        <Route path="showcase/:id" element={<Showcase />} />

        <Route path="products" element={<Products />} />
        <Route
          path="products/:slug"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/:slug" element={<BlogDetail />} />

        <Route path="login" element={<Login />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="checkout/:slug"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:slug"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="payment-failed" element={<PaymentFailed />} />

        <Route path="payout" element={<Payout />} />
        <Route path="payout/:slug" element={<PayoutCheck />} />

        <Route
          path="orders/:slug/bill"
          element={
            <ProtectedRoute>
              <OrderBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:slug/quote"
          element={
            <ProtectedRoute>
              <OrderQuote />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin section — full-page layout, no public site header/footer */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="blogs" element={<BlogsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="demand-orders" element={<DemandOrdersAdmin />} />
          <Route path="contacts" element={<ContactsAdmin />} />
          <Route path="delivery-charges" element={<DeliveryChargesAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="client-logos" element={<ClientLogosAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}
