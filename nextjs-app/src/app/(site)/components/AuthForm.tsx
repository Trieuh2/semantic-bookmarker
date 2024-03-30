'use client';

import Button from '@/app/components/Button';
import Input from '@/app/components/inputs/Input';
import Image from 'next/image';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import SocialButton from './AuthSocialButton';
import AuthSocialButton from './AuthSocialButton';
import { BsGoogle } from 'react-icons/bs';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    console.log(1);
  };


  return (
    <div className="flex flex-col w-full max-w-[400px] mx-auto">
      <Image
        width={72}
        height={72}
        className="mx-auto"
        src="/images/logo.png"
        alt="Logo"
      />
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email or username"
          id="email"
          type="email"
          register={register}
          disabled={isLoading}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          register={register}
          disabled={isLoading}
        />
        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </form>
      <div className="w-full border-t border-neutral-700 my-4" />
      <div>
        <div className="flex gap-2">
          <AuthSocialButton
            icon={BsGoogle}
            onClick={() => console.log(1)}
            source="Google"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
