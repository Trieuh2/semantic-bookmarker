"use client";

import Image from "next/image";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGoogle } from "react-icons/bs";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/inputs/Input";
import Button from "@/app/components/Button";
import axios from "axios";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<Variant>("LOGIN");

  const toggleVariant = useCallback(() => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  }, [variant]);

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

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    if (variant === "REGISTER") {
      try {
        await axios.post("/api/register", data);
        signIn("credentials", data);
      } catch (error) {
        console.error("Error during registration:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (variant === "LOGIN") {
      try {
        const callback = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        if (callback?.error) {
        } else if (callback?.ok) {
          router.push("/collections");
        }
      } catch (error) {
        console.error("Error during registration:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
          label="Email Address"
          id="email"
          type="email"
          required
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
          {variant === "LOGIN" ? "Sign in" : "Sign up"}
        </Button>
      </form>
      <div className="w-full border-t border-neutral-700 my-4" />
      <div className="flex flex-col gap-4">
        <AuthSocialButton
          icon={BsGoogle}
          onClick={() => socialSignIn("google")}
          source="Google"
          disabled={isLoading}
        />
        <button
          className="
          px-2
          py-1
          text-orange-300
          hover:bg-zinc-700
          rounded-md
          transition-colors
          duration-150
        "
          onClick={toggleVariant}
        >
          {variant === "LOGIN" ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
