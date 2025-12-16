"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { wsr } from "@/utils/wsr";

export default function SignInForm() {
  const router = useRouter();

  /* ================= STATE ================= */

  const [email, setEmail] = useState("admin@noqbot.com");
  const [password, setPassword] = useState("ChangeThis@123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ================= HANDLER ================= */

  const handleLogin = async () => {
    let hasError = false;
    setApiError(null);

    // Email validation
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) return;

    try {
      setLoading(true);

      const res = await wsr<{ success: boolean; data: any }>(
        "/api/auth/login",
        {
          method: "POST",
          body: {
            email,
            password,
          },
        },
      );

      // ✅ Safety check
      if (!res?.success) {
        setApiError("Invalid email or password");
        return;
      }

      // ✅ Redirect based on role
      router.replace("/dashboard");
      // const role = res.data.role;
      // if (role === "super_admin") {
      //   router.replace("/");
      // } else if (role === "client_admin") {
      //   router.replace("/dashboard");
      // } else {
      //   router.replace("/bookings");
      // }
    } catch (err: any) {
      setApiError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <h1 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90">
            Sign In
          </h1>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in
          </p>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="admin@noqbot.com"
                defaultValue={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                hint={emailError ? "Enter a valid email address" : ""}
              />
            </div>

            {/* Password */}
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  error={passwordError}
                  hint={passwordError ? "Password is required" : ""}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                </span>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-3">
              <Checkbox checked={remember} onChange={setRemember} />
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Keep me logged in
              </span>
            </div>

            {/* API Error */}
            {apiError && <p className="text-error-500 text-sm">{apiError}</p>}

            {/* Submit */}
            <Button
              size="sm"
              className="w-full"
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
