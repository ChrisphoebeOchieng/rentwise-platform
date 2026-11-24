const roleRoutes = {
  Administrator: "/portal/administrator",
  Landlord: "/portal/landlord",
  "Property Manager": "/portal/manager",
  Tenant: "/portal/tenant",
};

export function getRoleRoute(role) {
  return roleRoutes[role] || "/portal/tenant";
}
