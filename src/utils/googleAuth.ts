import { authApi } from "../libs/api/authApi";
import { profileApi } from "../libs/api/profileApi";
import { storage } from "../libs/storage";

/**
 * Handle Google Login/Register
 * @param idToken - Google ID Token from OAuth
 * @param role - "Student" or "Teacher" (default: "Student" for login page)
 * @returns Login response with user info
 */
export async function handleGoogleAuth(
  idToken: string,
  role: "Student" | "Teacher" = "Student"
) {
  // Call appropriate API based on role
  const response =
    role === "Teacher"
      ? await authApi.googleLoginTeacher(idToken)
      : await authApi.googleLoginStudent(idToken);

  // Save tokens
  storage.setToken(response.accesToken); // Note: BE has typo "accesToken"
  storage.setRefreshToken(response.refreshToken);

  // Get full profile info
  let fullName = response.email.split("@")[0]; // Default from email
  let avatarURL: string | null = null;

  try {
    if (response.role === "Student") {
      const profileResponse = await profileApi.getStudentProfile(
        response.accountId
      );
      fullName = profileResponse.profile.fullName;
      avatarURL = profileResponse.profile.avatarURL || null;
    } else if (response.role === "Teacher") {
      const profileResponse = await profileApi.getTeacherProfile(
        response.accountId
      );
      fullName = profileResponse.profile.fullName;
      avatarURL = profileResponse.profile.avatarURL || null;
    }
  } catch (profileError) {
    console.warn("Could not fetch profile, using email name:", profileError);
  }

  // Create user object
  const user = {
    id: response.accountId.toString(),
    email: response.email,
    name: fullName,
    role: response.role as "Admin" | "Teacher" | "Student",
    avatar: avatarURL,
  };

  // Save user to storage
  storage.setUser(user);

  // Dispatch event for other components
  window.dispatchEvent(new Event("userUpdated"));

  return { user, response };
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPath(role: string): string {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Teacher":
      return "/teacher";
    case "Student":
      return "/student";
    default:
      return "/";
  }
}
