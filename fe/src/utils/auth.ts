export const validatePassword = (value: string) => {
  const rules = [
    { test: value.length >= 8, message: "minimal 8 karakter" },
    { test: /[A-Z]/.test(value), message: "memiliki huruf kapital" },
    { test: /[0-9]/.test(value), message: "memiliki angka" },
    { test: /[^A-Za-z0-9]/.test(value), message: "memiliki simbol" },
  ];

  return rules.filter((r) => !r.test).map((r) => r.message);
};

export const validateAuthForm = (
  isLogin: boolean,
  formValues: { username: string; password: string }
) => {
  const errors = { username: "", password: "" };

  if (!formValues.username.trim()) {
    errors.username = "Username wajib diisi";
  }
  if (!formValues.password.trim()) {
    errors.password = "Password wajib diisi";
  } else if (!isLogin) {
    console.log(isLogin);
    const passError = validatePassword(formValues.password);
    if (formValues.password.length > 0 && passError.length > 0) {
      errors.password = "Password harus " + passError.join(", ");
    }
  }
  return errors;
};
