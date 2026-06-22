import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { spriteSheet } from "./components/ui/Icons";
import { LandingPage } from "./pages/LandingPage";
import { ProductListPage } from "./pages/ProductListPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RoleSelectPage } from "./pages/RoleSelectPage";
import { ReviewPage } from "./pages/ReviewPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { Navigate } from "react-router-dom";
import { BuyerWalletPage } from "./pages/buyer/BuyerWalletPage";
import { BuyerAddressPage } from "./pages/buyer/BuyerAddressPage";
import { BuyerCartPage } from "./pages/buyer/BuyerCartPage";
import { BuyerCheckoutPage } from "./pages/buyer/BuyerCheckoutPage";
import { BuyerOrdersPage } from "./pages/buyer/BuyerOrdersPage";
import { SellerDashboard } from "./pages/seller/SellerDashboard";
import { SellerStorePage } from "./pages/seller/SellerStorePage";
import { SellerProductsPage } from "./pages/seller/SellerProductsPage";
import { SellerOrdersPage } from "./pages/seller/SellerOrdersPage";
import { SellerIncomeReport } from "./pages/seller/SellerIncomeReport";
import { BuyerSpendingReport } from "./pages/buyer/BuyerSpendingReport";
import { DriverDashboard } from "./pages/driver/DriverDashboard";
import { DriverJobsPage } from "./pages/driver/DriverJobsPage";
import { DriverHistoryPage } from "./pages/driver/DriverHistoryPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminVouchersPage } from "./pages/admin/AdminVouchersPage";
import { AdminPromosPage } from "./pages/admin/AdminPromosPage";
import { AdminOverduePage } from "./pages/admin/AdminOverduePage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      {spriteSheet}
      <Routes>
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route path="/role-select" element={<Layout><RoleSelectPage /></Layout>} />
      <Route path="/reviews" element={<Layout><ReviewPage /></Layout>} />
      <Route path="/orders/:id" element={<Layout><OrderDetailPage /></Layout>} />

      <Route path="/buyer/dashboard" element={<Navigate to="/products" replace />} />
      <Route path="/buyer/wallet" element={<BuyerWalletPage />} />
      <Route path="/buyer/addresses" element={<BuyerAddressPage />} />
      <Route path="/buyer/cart" element={<BuyerCartPage />} />
      <Route path="/buyer/checkout" element={<BuyerCheckoutPage />} />
      <Route path="/buyer/orders" element={<BuyerOrdersPage />} />
      <Route path="/buyer/spending" element={<BuyerSpendingReport />} />

      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/store" element={<SellerStorePage />} />
      <Route path="/seller/products" element={<SellerProductsPage />} />
      <Route path="/seller/orders" element={<SellerOrdersPage />} />
      <Route path="/seller/income" element={<SellerIncomeReport />} />

      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/driver/jobs" element={<DriverJobsPage />} />
      <Route path="/driver/history" element={<DriverHistoryPage />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
      <Route path="/admin/promos" element={<AdminPromosPage />} />
      <Route path="/admin/overdue" element={<AdminOverduePage />} />
      </Routes>
    </>
  );
}
