export type Action = "view_contact" | "create_listing" | "edit_listing";

export type SessionUser = {
  id: string;
  email?: string | null;
  membership_tier?: "free" | "pro" | null;
};

type ResourceWithOwner = {
  owner_id?: string | null;
};

export function can(
  user: SessionUser | null,
  action: Action,
  resource?: ResourceWithOwner,
): boolean {
  switch (action) {
    case "view_contact":
      return !!user;
    // Membership later: return user?.membership_tier === "pro";
    case "create_listing":
      return !!user;
    case "edit_listing":
      return !!user && resource?.owner_id === user.id;
  }
}
