# Frontend Authentication Architecture

This document explains in detail how the Authentication flow (Login, Register, Forgot Password, Reset Password) is implemented in the frontend, how the components interact with each other, and how API calls are made to the backend.

## 1. The Component Layer (UI & Forms)

The user interacts with React forms that capture input data and handle basic UI validations.

### `src/components/RegisterForm.jsx` & `src/components/LoginForm.jsx`
- These forms use React's `useState` to store what the user types (e.g., `email`, `password`, `username`).
- They handle basic frontend validation (e.g., checking if `password` and `confirmPassword` match in the register form).
- When the user submits the form, the `handleSubmit` function prevents the default page reload, sets a loading state (`isLoading=true`), and calls an action from our custom hook `useAuth()`.
- They also implement Google OAuth using `@react-oauth/google` by invoking the `useGoogleLogin` hook.

### `src/pages/ForgotPassword.jsx` & `src/pages/ResetPassword.jsx`
- **Forgot Password**: Collects the user's email and calls the `forgotPassword` function. If successful, it navigates the user to the Reset Password page.
- **Reset Password**: Collects the 6-digit OTP sent to the email along with a new password, then calls the `resetPassword` function.

## 2. The Hook Layer: `src/hooks/useAuth.js`

To make it easy for any component to access authentication logic, we use a custom hook:
- `useAuth()` wraps React's `useContext(AuthContext)`.
- It acts as a bridge. Instead of importing the context directly into every component, components just call `const { login, register, user } = useAuth();`.
- It also provides error checking to ensure it's only used inside components wrapped by the `<AuthProvider>`.

## 3. The State Management Layer: `src/context/AuthContext.jsx`

This is the "Global Box" that holds the user's session data and the logic that connects the UI to the API services.

- **State**: It holds the `user` object (null if not logged in) and a `loading` boolean.
- **Actions**: It defines functions like `login`, `register`, `forgotPassword`, and `logout`.
- **Workflow**: 
  1. A component (like `LoginForm`) calls `login(credentials)`.
  2. The `login` function in the context calls the `authService.login(credentials)`.
  3. If the service call is successful and returns user data, it updates the global `user` state via `setUser(response.data)`.
  4. This state change automatically triggers a re-render for any component (like the Dashboard) that listens to the `user` object.

## 4. The Service Layer: `src/api/auth.service.js`

This layer abstracts all HTTP requests away from the UI and Context. It focuses purely on communicating with the backend API.

- It defines functions like `authService.login(credentials)`.
- **Error Handling**: It has a robust `catch` block that parses backend errors. If the backend returns a Zod validation error (e.g., "Password must be at least 8 characters"), the service extracts the first specific error message and throws it back to the Context, which then bubbles up to the Form to display in the UI.
- It uses the constants defined in `src/api/endpoints.js` to ensure URL paths are consistent (e.g., `ENDPOINTS.AUTH.LOGIN`).

## 5. The Network Layer: `src/api/axios.js`

This is the very bottom of the stack, responsible for physically sending the data over the network to the backend server.

- **Custom Instance**: We create a custom `axiosInstance`.
- **Base URL**: It automatically prepends the `API_BASE_URL` (usually `http://localhost:5000/api`) to all requests.
- **Credentials (`withCredentials: true`)**: This is the most crucial setting. Because the backend uses HTTP-only Cookies for session management, this setting allows the browser to send those cookies with every request and accept cookies sent back from the server in the `Set-Cookie` header.
- **Headers**: It ensures all data is sent as `application/json`.

---

### Summary Flow (Example: User Logs In)

1. User types in `LoginForm.jsx` and clicks submit.
2. `LoginForm` calls `login(formData)` from `useAuth()`.
3. `useAuth()` passes the request to `AuthContext.jsx`.
4. `AuthContext.jsx` calls `authService.login(credentials)`.
5. `authService.js` calls `axiosInstance.post('/auth/login', credentials)`.
6. `axios.js` sends the actual HTTP POST request to the backend with the credentials.
7. The backend verifies the data, sets a cookie, and returns the user object.
8. The data flows back up the chain: Axios -> Service -> Context.
9. Context calls `setUser(data)`, saving the user globally.
10. `LoginForm` sees the success, stops its loading spinner, and redirects to `/dashboard`.
