"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, Shield, ShieldCheck } from "lucide-react";
import { authenticator } from "otplib";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: { username: string; role: string } | null;
  twoFactorEnabled: boolean;
  enableTwoFactor: () => string;
  disableTwoFactor: () => void;
  verifyOtp: (token: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [isOtpStep, setIsOtpStep] = useState(false);

  useEffect(() => {
    // Check for persisted session on mount
    const checkPersistedSession = () => {
      try {
        const persistedAuth = localStorage.getItem("nulldental_auth");
        const persisted2FA = localStorage.getItem("nulldental_2fa");
        if (persistedAuth) {
          const authData = JSON.parse(persistedAuth);
          // In a real app, you'd validate the session with the server
          // For now, we'll trust the localStorage data
          setIsAuthenticated(true);
          setUser(authData.user);
        }
        if (persisted2FA) {
          const twoFAData = JSON.parse(persisted2FA);
          setTwoFactorEnabled(twoFAData.enabled);
          setTwoFactorSecret(twoFAData.secret);
        }
      } catch (error) {
        console.error("Error loading persisted session:", error);
        localStorage.removeItem("nulldental_auth");
        localStorage.removeItem("nulldental_2fa");
      } finally {
        setIsLoading(false);
      }
    };

    checkPersistedSession();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    if (username === "admin" && password === "admin123") {
      if (twoFactorEnabled) {
        setIsOtpStep(true);
        return true; // Password correct, proceed to OTP
      } else {
        const userData = { username: "admin", role: "Administrator" };
        setIsAuthenticated(true);
        setUser(userData);

        // Persist session
        localStorage.setItem(
          "nulldental_auth",
          JSON.stringify({
            user: userData,
            timestamp: Date.now(),
          })
        );

        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setIsOtpStep(false);
    localStorage.removeItem("nulldental_auth");
  };

  const enableTwoFactor = (): string => {
    const secret = authenticator.generateSecret();
    setTwoFactorSecret(secret);
    setTwoFactorEnabled(true);
    localStorage.setItem(
      "nulldental_2fa",
      JSON.stringify({ enabled: true, secret })
    );
    return secret;
  };

  const disableTwoFactor = () => {
    setTwoFactorEnabled(false);
    setTwoFactorSecret("");
    localStorage.removeItem("nulldental_2fa");
  };

  const verifyOtp = (token: string): boolean => {
    try {
      return authenticator.verify({ token, secret: twoFactorSecret });
    } catch {
      return false;
    }
  };

  const handleOtpVerified = () => {
    const userData = { username: "admin", role: "Administrator" };
    setIsAuthenticated(true);
    setUser(userData);
    setIsOtpStep(false);

    // Persist session
    localStorage.setItem(
      "nulldental_auth",
      JSON.stringify({
        user: userData,
        timestamp: Date.now(),
      })
    );
  };

  // Show loading screen while checking persisted session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
              Restoring Session
            </CardTitle>
            <p className="text-gray-600">
              Please wait while we restore your session...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={login}
        isOtpStep={isOtpStep}
        onVerifyOtp={verifyOtp}
        onOtpVerified={handleOtpVerified}
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        twoFactorEnabled,
        enableTwoFactor,
        disableTwoFactor,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function LoginScreen({
  onLogin,
  isOtpStep,
  onVerifyOtp,
  onOtpVerified,
}: {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isOtpStep: boolean;
  onVerifyOtp: (token: string) => boolean;
  onOtpVerified: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isOtpStep) {
        const success = onVerifyOtp(otp);
        if (success) {
          onOtpVerified();
        } else {
          setError("Invalid OTP code");
        }
      } else {
        const success = await onLogin(username, password);
        if (!success) {
          setError("Invalid username or password");
        }
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {isOtpStep ? (
              <ShieldCheck className="h-8 w-8 text-white" />
            ) : (
              <LogIn className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isOtpStep ? "Two-Factor Authentication" : "NullDental Admin"}
          </CardTitle>
          <p className="text-gray-600">
            {isOtpStep
              ? "Enter the 6-digit code from your authenticator app"
              : "Sign in to access the admin portal"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isOtpStep ? (
              <div>
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading
                ? isOtpStep
                  ? "Verifying..."
                  : "Signing in..."
                : isOtpStep
                  ? "Verify"
                  : "Sign In"}
            </Button>
          </form>

          {!isOtpStep && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Demo Credentials:
              </p>
              <p className="text-xs text-gray-500">Username: admin</p>
              <p className="text-xs text-gray-500">Password: admin123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
