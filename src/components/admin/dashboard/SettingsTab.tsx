import { useState, type FormEvent } from "react";
import { Store, Phone, Mail, MapPin, Clock, Truck, Share2, Save, Sparkles } from "lucide-react";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SettingsTab() {
  const { settings, updateSettings } = useBakeryStore();
  const { user } = useAuth();

  const [shopName, setShopName] = useState(settings.shopName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [openingHours, setOpeningHours] = useState(settings.openingHours);
  const [deliveryInfo, setDeliveryInfo] = useState(settings.deliveryInfo);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [facebook, setFacebook] = useState(settings.facebook);
  const [youtube, setYoutube] = useState(settings.youtube);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings({
      shopName: shopName.trim(),
      logoUrl: logoUrl.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      openingHours: openingHours.trim(),
      deliveryInfo: deliveryInfo.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      youtube: youtube.trim(),
    });
    setSaving(false);
    toast.success("Bakery shop settings updated in Firestore!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Shop Settings</h2>
        <p className="text-xs text-[#8C7A70]">Configure shop profile, contact phone, physical location and social channels</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand Info */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F2EBE5]">
            <Store className="h-4 w-4 text-rose" />
            <h3 className="font-display text-base font-bold text-[#1A100C]">Brand & Profile</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Bakery Brand Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Shop Logo Asset Path
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Primary Contact Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Orders & Enquiry Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Physical Shop Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Delivery Coverage Information
              </label>
              <input
                type="text"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F2EBE5]">
            <Share2 className="h-4 w-4 text-rose" />
            <h3 className="font-display text-base font-bold text-[#1A100C]">Social Media Channels</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                Facebook URL
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D44] mb-1">
                YouTube Channel
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full rounded-xl border border-[#EFE4DB] p-2.5 text-xs text-[#1A100C] focus:border-rose focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Administrator Profile Card */}
        <div className="rounded-3xl border border-[#EFE4DB] bg-[#FAF7F2] p-6 sm:p-8">
          <h3 className="font-display text-base font-bold text-[#1A100C]">Active Administrator Session</h3>
          <p className="text-xs text-[#8C7A70] mt-0.5">Firebase Authentication credentials and permissions</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose text-white shadow-soft font-bold text-base">
              T
            </div>
            <div>
              <p className="font-bold text-sm text-[#1A100C]">{user?.fullName || "Tharshini (Owner & Head Baker)"}</p>
              <p className="text-xs font-mono text-rose">{user?.email || "tharshini1773@gmail.com"}</p>
              <p className="text-[0.68rem] text-[#8C7A70] mt-0.5">Authorized Primary Administrator</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} variant="rose" size="lg" className="font-bold gap-2 shadow-soft">
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving to Firestore…" : "Save All Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
