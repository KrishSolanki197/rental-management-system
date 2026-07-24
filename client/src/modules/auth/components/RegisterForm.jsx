import React, { useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="space-y-4">
        <Input 
          id="name" 
          type="text" 
          label="Full Name" 
          placeholder="John Doe" 
          required 
          autoComplete="name"
        />

        <Input 
          id="register-email" 
          type="email" 
          label="Email Address" 
          placeholder="name@company.com" 
          required 
          autoComplete="email"
        />

        <Input 
          id="phone" 
          type="tel" 
          label="Phone Number" 
          placeholder="+1 (555) 000-0000" 
          autoComplete="tel"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            id="register-password" 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            required 
            autoComplete="new-password"
          />
          <Input 
            id="confirm-password" 
            type="password" 
            label="Confirm Password" 
            placeholder="••••••••" 
            required 
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="mt-8">
        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
