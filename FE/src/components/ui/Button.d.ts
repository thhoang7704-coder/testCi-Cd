declare module '@/components/ui/Button' {
  import * as React from 'react';

  export type ButtonProps = {
    text?: string;
    type?: string;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    icon?: string;
    loadingClass?: string;
    iconPosition?: string;
    iconClass?: string;
    link?: string;
    onClick?: React.MouseEventHandler<any>;
    div?: boolean;
  };

  const Button: React.FC<ButtonProps>;
  export default Button;
}
