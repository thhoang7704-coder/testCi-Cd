import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/api/auth/authSlice";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

const schema = yup
  .object({
    username: yup.string().required("Username is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.login({
        username: data.username,
        password: data.password,
      });

      // Dispatch user data to Redux store
      dispatch(setAuth({
        user: response.user,
        token: response.token
      }));

      toast.success("Login Successful");

      // Redirect based on user role
      const from = location.state?.from?.pathname || getDefaultRoute(response.user.role);
      navigate(from, { replace: true });

    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultRoute = (role) => {
    const roleRoutes = {
      SYSTEM_ADMIN: '/system-admin/dashboard',
      LAB_ADMIN: '/lab-admin/dashboard',
      COMPANY: '/enterprise/dashboard',
      MENTOR: '/mentor/dashboard',
      TALENT: '/candidate/dashboard',
      TALENT_LEADER: '/candidate/dashboard',
    };
    return roleRoutes[role] || '/candidate/dashboard';
  };

  const [checked, setChecked] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <Textinput
        name="username"
        label="Username"
        placeholder="Enter your username"
        register={register}
        error={errors.username}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        register={register}
        error={errors.password}
        className="h-[48px]"
      />
      <div className="flex justify-between">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Keep me signed in"
        />
        <Link
          to="/forgot-password"
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        text="Sign in"
        className="btn btn-dark block w-full text-center "
        isLoading={isLoading}
      />
    </form>
  );
};

export default LoginForm;
