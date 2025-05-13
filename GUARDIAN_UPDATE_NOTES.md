# Role Update: Parent to Guardian

## Summary of Changes

This update changes all references from "parent" to "guardian" throughout the LMS system.

### Updated Files:

1. **Menu System**
   - `lib/menu-list.ts` - Updated role type from 'parent' to 'guardian'
   - All guardian menu items now use `/guardian/` prefix instead of `/parent/`

2. **Authentication**
   - `lib/auth-utils.ts` - Updated role types and functions to use 'guardian'

3. **Components**
   - Created new `guardian-dashboard` folder with all components
   - Renamed all parent-dashboard components to guardian-dashboard
   - Updated all links and paths to use guardian routes

4. **Routing**
   - All guardian routes now use `/guardian/` prefix
   - Children management route: `/guardian/children`
   - Dashboard route: `/guardian/dashboard`

5. **API Integration**
   - The hook `use-children-list.ts` now uses `guardianId` instead of `parentId`
   - API calls remain the same but parameter names updated

### Key Changes:
- All instances of "parent" changed to "guardian"
- URL paths updated from `/parent/` to `/guardian/`
- Component names and file paths updated
- Type definitions updated to use 'guardian' role

### Migration Notes:
- Existing parent routes will need to be redirected to guardian routes
- Database references to "parent" may need updates
- API endpoints should be updated to use guardian terminology
- localStorage keys for roles should be updated during login

### File Structure:
```
components/
├── guardian-dashboard/
│   ├── child-card.tsx
│   ├── child-card-skeleton.tsx
│   ├── children-list.tsx
│   ├── add-child-button.tsx
│   ├── guardian-sidebar.tsx
│   ├── guardian-menu.tsx
│   └── index.ts
├── admin-panel-guardian/
│   └── sidebar.tsx
```

All components are now consistent with using "guardian" terminology throughout the application.
