// Updated permissions.js - Hỗ trợ multiple roles từ DB
export const ROLE_PERMISSIONS = {
  'admin': ['view', 'create', 'edit', 'delete', 'approve'],    
  'editor': ['view', 'create', 'edit', 'delete'],             
  'viewer': ['view']                                          
};

export const getCurrentUserRole = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    // Xử lý multiple roles
    const roles = userInfo.role ? userInfo.role.split(',').map(r => r.trim()) : ['viewer'];
    
    // Debug log
    
    // Trả về tất cả các roles hợp lệ
    const validRoles = roles.filter(role => ROLE_PERMISSIONS[role]);
    if (validRoles.length === 0) {
      console.warn(`No valid roles found in: ${roles.join(',')}, defaulting to viewer`);
      return ['viewer'];
    }
    
    return validRoles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    return ['viewer'];
  }
};

export const hasPermission = (action, userRoles = null) => {
  const roles = userRoles || getCurrentUserRole();
  
  // Kiểm tra từng role xem có permission không
  return roles.some(role => {
    const permissions = ROLE_PERMISSIONS[role] || ['view'];
    return permissions.includes(action);
  });
};

export const hasAllPermissions = (actions, userRoles = null) => {
  const roles = userRoles || getCurrentUserRole();
  
  return actions.every(action => {
    // Nếu bất kỳ role nào có permission này thì pass
    return roles.some(role => {
      const permissions = ROLE_PERMISSIONS[role] || ['view'];
      return permissions.includes(action);
    });
  });
};

export const hasAnyPermission = (actions, userRoles = null) => {
  const roles = userRoles || getCurrentUserRole();
  
  return actions.some(action => {
    // Nếu bất kỳ role nào có bất kỳ permission nào thì pass
    return roles.some(role => {
      const permissions = ROLE_PERMISSIONS[role] || ['view'];
      return permissions.includes(action);
    });
  });
};

export const PermissionGuard = ({ children, requiredPermissions = [], requireAll = true }) => {
  const userRole = getCurrentUserRole();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(requiredPermissions, userRole)
    : hasAnyPermission(requiredPermissions, userRole);
    
  return hasAccess ? children : null;
};

// Helper function để hiển thị role name đẹp hơn
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Admin',
    'editor': 'Editor', 
    'viewer': 'Viewer',
    'imp': 'Imp',
    'bo': 'Bo'
  };
  return roleNames[role] || role;
};