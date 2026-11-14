import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Lock,
  LogOut,
  Save,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: pageMeta(
      "Admin Settings — Sweet Crumbs Bakery",
      "Configure store details, business hours, contact numbers, and administrator account security.",
    ),
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { user, resetPassword, updateAdminProfile, logout } = useAuth();
  const { settings, updateSettings } = useBakeryStore();
  const navigate = useNavigate();

  // Store Settings State
  const [shopName, setShopName] = useState(settings.shopName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [openingHours, setOpeningHours] = useState(settings.openingHours);

  // Profile State
  const [adminName, setAdminName] = useState(user?.fullName || "Tharshini");
  const [adminPhone, setAdminPhone] = useState(user?.phone || "7550362608");

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const handleSaveStore = async (e: FormEvent) => {
    e.preventDefault();
    await updateSettings({
      shopName: shopName.trim(),
      logoUrl: logoUrl.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      openingHours: openingHours.trim(),
    });
    toast.success("Bakery store information updated successfully!");
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await updateAdminProfile({
      fullName: adminName.trim(),
      phone: adminPhone.trim(),
    });
    if (res.success) {
      toast.success("Administrator profile updated!");
    } else {
      toast.error(res.error || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPassLoading(true);
    const res = await resetPassword(newPassword);
    setPassLoading(false);

    if (res.success) {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security credentials updated! Please use your new password next time you sign in.");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AdminLayout
      title="Store Settings & Security"
      subtitle="Manage bakery contact details, customer hours, and administrator credentials."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 1. Bakery Business Information Form */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-[#1A100C]">Bakery Store Details</h2>
              <p className="text-xs text-[#6B5E57]">Public contact coordinates displayed across the website.</p>
            </div>
          </div>

          <form onSubmit={handleSaveStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Bakery Brand Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Logo Asset Path / URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Primary Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-9 pr-3 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                  <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-[#8C7A70]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Enquiry Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-9 pr-3 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-[#8C7A70]" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Bakery Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Opening Hours
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] pl-9 pr-3 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
                <Clock className="absolute left-3 top-3 h-3.5 w-3.5 text-[#8C7A70]" />
              </div>
            </div>

            <Button type="submit" variant="rose" size="sm" className="shadow-soft gap-2 mt-2">
              <Save className="h-4 w-4" /> Save Store Details
            </Button>
          </form>
        </div>

        {/* 2. Admin Profile & Account Security */}
        <div className="space-y-8">
          {/* Profile Form */}
          <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose/10 text-rose">
                <User className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-[#1A100C]">Admin Profile</h2>
                <p className="text-xs text-[#6B5E57]">Active administrator account details.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Full Name / Baker Title
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                    Email Account
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "tharshini1773@gmail.com"}
                    className="w-full rounded-xl border border-[#EFE4DB] bg-[#EFE4DB]/40 px-3.5 py-2.5 text-xs text-[#8C7A70] cursor-not-allowed"
                  />
                </div>
              </div>

              <Button type="submit" variant="rose" size="sm" className="shadow-soft gap-2">
                <Save className="h-4 w-4" /> Update Profile
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Lock className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-[#1A100C]">Change Password</h2>
                <p className="text-xs text-[#6B5E57]">Update your administrative security credentials.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#EFE4DB] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="submit"
                  disabled={passLoading}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#1A100C]"
                >
                  <Lock className="h-4 w-4 text-rose" /> Update Password
                </Button>

                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

