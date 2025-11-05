/**
 * Utility functions để decode và xử lý JWT token
 */

/**
 * Decode JWT token mà không verify (chỉ lấy payload)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload hoặc null nếu lỗi
 */
export const decodeToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    // JWT token có format: header.payload.signature
    // Chúng ta chỉ cần decode payload (phần giữa)
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    // Base64URL decode
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Lấy token từ cookie (không dùng được vì cookie là httpOnly)
 * Thay vào đó, chúng ta sẽ lấy từ response sau khi login
 * Hoặc decode từ token nếu có trong localStorage (tạm thời)
 * 
 * Thực tế, với cookie httpOnly, frontend không thể đọc được
 * Nên chúng ta sẽ lưu user info vào localStorage sau khi login
 * Nhưng user info sẽ được decode từ token thay vì từ response
 */
export const getTokenFromCookie = () => {
  // Không thể đọc httpOnly cookie từ JavaScript
  // Cookie sẽ tự động được gửi kèm request
  return null;
};

/**
 * Lấy thông tin user từ token (nếu token có trong localStorage - tạm thời)
 * Hoặc từ decoded token sau khi login
 */
export const getUserFromToken = () => {
  // Vì cookie là httpOnly nên không thể đọc từ frontend
  // Chúng ta sẽ lưu decoded user info vào localStorage sau khi login
  // Hoặc decode từ token nếu có
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    
    // Fallback: nếu có token trong localStorage, decode nó
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        return {
          userId: decoded.userId,
          username: decoded.username,
          company_id: decoded.company_id,
          role: decoded.role,
          email: decoded.email,
          avatar: decoded.avatar,
          department: decoded.department
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Kiểm tra token có hết hạn không (dựa vào exp claim)
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token còn hạn, false nếu hết hạn
 */
export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Lưu user info vào localStorage sau khi decode từ token
 * @param {string} token - JWT access token
 */
export const saveUserInfoFromToken = (token) => {
  if (!token) {
    return;
  }

  try {
    const decoded = decodeToken(token);
    if (decoded) {
      const userInfo = {
        userId: decoded.userId,
        username: decoded.username,
        company_id: decoded.company_id,
        role: decoded.role,
        email: decoded.email,
        avatar: decoded.avatar,
        department: decoded.department
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return userInfo;
    }
  } catch (error) {
    console.error('Error saving user info from token:', error);
  }
};

