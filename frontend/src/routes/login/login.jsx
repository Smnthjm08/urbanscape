import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/auth/login", {
        username,
        password,
      });
      console.log("Server response:", res);

      if (res.status === 200) {
        // Store user info in local storage
        localStorage.setItem("user", JSON.stringify(res.data));
        console.log("User info stored in local storage:", res.data);

        // Update user context
        updateUser(res.data);
        console.log("User context updated:", res.data);

        // Navigate to home page
        navigate("/");
      } else {
        setError("Login failed, please try again.");
        console.log("Login failed:", res);
      }
    } catch (err) {
      console.log("Error during login:", err);
      setError(err.response?.data?.message || "Failed to login!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            placeholder="Username"
          />
          <input
            name="password"
            required
            type="password"
            placeholder="Password"
          />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
