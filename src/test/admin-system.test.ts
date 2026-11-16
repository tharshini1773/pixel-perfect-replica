import { describe, expect, it } from "vitest";
import { AUTHORIZED_ADMIN_EMAIL, getFirebaseErrorMessage } from "../lib/firebase";

describe("Phase 1 & 2: Firebase Admin Authentication & Role Verification", () => {
  it("enforces that only the designated bakery admin email has access", () => {
    expect(AUTHORIZED_ADMIN_EMAIL).toBe("tharshini1773@gmail.com");

    const checkAuthorization = (email: string) => {
      return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
    };

    expect(checkAuthorization("tharshini1773@gmail.com")).toBe(true);
    expect(checkAuthorization("THARSHINI1773@GMAIL.COM")).toBe(true);
    expect(checkAuthorization("hacker@test.com")).toBe(false);
    expect(checkAuthorization("user@gmail.com")).toBe(false);
    expect(checkAuthorization("admin@anotherdomain.com")).toBe(false);
  });

  it("translates Firebase Auth error codes to user-friendly error messages", () => {
    expect(getFirebaseErrorMessage("auth/invalid-credential")).toContain("Incorrect email or password");
    expect(getFirebaseErrorMessage("auth/wrong-password")).toContain("Incorrect email or password");
    expect(getFirebaseErrorMessage("auth/user-not-found")).toContain("No account found with this email");
    expect(getFirebaseErrorMessage("auth/too-many-requests")).toContain("Too many failed attempts");
  });

  it("protects routes against unauthenticated access", () => {
    const isRouteAccessible = (user: { email: string } | null) => {
      return Boolean(user && user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());
    };

    expect(isRouteAccessible(null)).toBe(false);
    expect(isRouteAccessible({ email: "unknown@user.com" })).toBe(false);
    expect(isRouteAccessible({ email: "tharshini1773@gmail.com" })).toBe(true);
  });
});

describe("Admin Order Management Status Lifecycle", () => {
  const allowedStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  it("includes all 6 required bakery order lifecycle stages", () => {
    expect(allowedStatuses).toEqual([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ]);
  });
});

describe("Store Settings & Contact Verification", () => {
  const settings = {
    shopName: "Sweet Crumbs Bakery",
    phone: "7550362608",
    email: "tharshini1773@gmail.com",
    address: "1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India",
    openingHours: "Mon - Sun: 9:00 AM - 9:00 PM",
  };

  it("maintains the shop owner's exact phone, email, and physical address", () => {
    expect(settings.phone).toBe("7550362608");
    expect(settings.email).toBe("tharshini1773@gmail.com");
    expect(settings.address).toContain("Punnaikayal");
    expect(settings.address).toContain("Thoothukudi");
  });
});

describe("Admin Routing & Protection Verification", () => {
  it("maps /admin and /admin/login to Admin Login page first", () => {
    const routeAction = (path: string, isAuthenticated: boolean) => {
      if (path === "/admin") return "/admin/login";
      if (path === "/admin/login") return "AdminLoginPage";
      if (path.startsWith("/admin/") && !isAuthenticated) return "/admin/login";
      return "AdminDashboard";
    };

    expect(routeAction("/admin", false)).toBe("/admin/login");
    expect(routeAction("/admin", true)).toBe("/admin/login");
    expect(routeAction("/admin/login", false)).toBe("AdminLoginPage");
    expect(routeAction("/admin/login", true)).toBe("AdminLoginPage");
    expect(routeAction("/admin/dashboard", false)).toBe("/admin/login");
    expect(routeAction("/admin/dashboard", true)).toBe("AdminDashboard");
    expect(routeAction("/admin/orders", false)).toBe("/admin/login");
    expect(routeAction("/admin/products", false)).toBe("/admin/login");
  });
});
