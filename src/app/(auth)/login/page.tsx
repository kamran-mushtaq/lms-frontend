'use client';

import React, { useState } from 'react';
import { LoginForm } from "@/components/login-form";
import AuthSide from "@/components/auth-side";
import { Image } from 'lucide-react';

function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <img src="/images/logo.png" alt="Logo" className="w-40  mx-auto" />
            </div>
          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
      {/* Right side - Slider */}
      <AuthSide />
     
    </div>
  );
}

export default LoginPage;