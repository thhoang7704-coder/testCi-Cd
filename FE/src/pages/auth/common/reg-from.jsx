import React, { useState } from "react";
import { toast } from "react-toastify";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterUserMutation } from "@/store/api/auth/authApiSlice";

const schema = yup
  .object({
    fullName: yup.string().required("Full Name is Required"),
    username: yup
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username shouldn't be more than 50 characters")
      .required("Username is Required"),
    email: yup.string().email("Invalid email").required("Email is Required"),
    phone: yup.string().required("Phone is Required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password shouldn't be more than 20 characters")
      .required("Please enter password"),
  })
  .required();

const RegForm = () => {
  const [registerUser, { isLoading, isError, error, isSuccess }] =
    useRegisterUserMutation();

  const [checked, setChecked] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    if (!checked) {
      toast.error("Please accept Terms and Conditions");
      return;
    }

    try {
      // Backend expects UserDTO with `roles` (Set<String>) and optionally `username`.
      // Prefer explicit username from the form; fallback to email.
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        username: data.username,
        // Do not send roles on signup; backend will assign default USER.
        avatarUrl: null,
        isActive: true,
        emailVerified: false,
      };

      const response = await registerUser(payload);

      if (response.data?.success) {
        reset();
        toast.success(response.data?.message || "Sign up successfully");
        navigate("/login");
      } else if (response.error?.data?.errors?.length > 0) {
        toast.error(response.error.data.errors[0]);
      } else {
        toast.error(response.error?.data?.message || "Sign up failed");
      }
    } catch (error) {
      toast.error(
        error.message || "An error occurred. Please try again later.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Textinput
        name="fullName"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        register={register}
        error={errors.fullName}
        className="h-[48px]"
      />
      <Textinput
        name="username"
        label="Username"
        type="text"
        placeholder="Enter your username"
        register={register}
        error={errors.username}
        className="h-[48px]"
      />
      <Textinput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />
      <Textinput
        name="phone"
        label="Phone"
        type="tel"
        placeholder="Enter your phone number"
        register={register}
        error={errors.phone}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        register={register}
        error={errors.password}
        className="h-[48px]"
      />
      <Checkbox
        label="You accept our Terms and Conditions and Privacy Policy"
        value={checked}
        onChange={() => setChecked(!checked)}
      />
      <Button
        type="submit"
        text="Create an account"
        className="btn btn-dark block w-full text-center"
        isLoading={isLoading}
      />
    </form>
  );
};

export default RegForm;
