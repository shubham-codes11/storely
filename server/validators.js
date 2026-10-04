// Validation rules as mandated by PDF specifications:
// - Name: Min 20 characters, Max 60 characters.
// - Address: Max 400 characters.
// - Password: 8-16 characters, must include at least one uppercase letter and one special character.
// - Email: Must follow standard email validation rules.
// - Rating: 1 to 5.

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9]/;
export const UPPERCASE_REGEX = /[A-Z]/;

export function validateName(name) {
  if (typeof name !== 'string') return 'Name must be a text string.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters long.';
  }
  return null;
}

export function validateAddress(address) {
  if (typeof address !== 'string') return 'Address must be a text string.';
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Address is required.';
  if (trimmed.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
}

export function validateEmail(email) {
  if (typeof email !== 'string') return 'Email must be a valid string.';
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please provide a valid email address.';
  }
  return null;
}

export function validatePassword(password) {
  if (typeof password !== 'string') return 'Password must be a string.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

export function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

export function validateUserPayload({ name, email, password, address, role }, isSignup = false) {
  const errors = {};
  
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  if (!isSignup && role) {
    if (!['admin', 'user', 'store_owner'].includes(role)) {
      errors.role = 'Role must be admin, user, or store_owner.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateStorePayload({ name, email, address }) {
  const errors = {};
  
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
