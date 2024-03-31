"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGoogle } from "react-icons/bs";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "../../components/inputs/Input";
import Button from "../../components/Button";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/collections");
    }
  }, [session?.status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const socialSignIn = (source: string) => {
    setIsLoading(true);

    signIn(source, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          // TODO: ADD TOAST
        }
        if (callback?.ok && !callback?.error) {
          // TODO: ADD TOAST
        }
      })
      .finally(() => setIsLoading(false));
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
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
            onClick={() => socialSignIn("google")}
            source="Google"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
