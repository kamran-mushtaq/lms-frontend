// Add this after successful login in AuthContext
// After setting the user in AuthContext login function, add:
if (userData.type === 'guardian') {
  localStorage.setItem('userRole', 'guardian');
}
