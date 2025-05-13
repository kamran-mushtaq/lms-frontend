// lib/auth-utils.ts
export function getUserRole(): 'admin' | 'parent' | 'student' {
  try {
    // Try to get role from localStorage
    const role = localStorage.getItem('userRole');
    if (role && ['admin', 'parent', 'student'].includes(role)) {
      return role as 'admin' | 'parent' | 'student';
    }

    // Try to get role from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // Check for 'type' property as used in AuthContext
      if (user.type && ['admin', 'parent', 'student'].includes(user.type)) {
        return user.type === 'parent' ? 'parent' : user.type;
      }
      // Also check for 'role' property as fallback
      if (user.role && ['admin', 'parent', 'student'].includes(user.role)) {
        return user.role === 'parent' ? 'parent' : user.role;
      }
    }

    // Try to get role from token payload
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token (basic implementation)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        if (decodedToken.type && ['admin', 'parent', 'student'].includes(decodedToken.type)) {
          return decodedToken.type === 'parent' ? 'parent' : decodedToken.type;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    // Default to admin if no role is found
    return 'admin';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'admin';
  }
}

export function setUserRole(role: 'admin' | 'parent' | 'student') {
  localStorage.setItem('userRole', role);
}

export function clearUserRole() {
  localStorage.removeItem('userRole');
}
