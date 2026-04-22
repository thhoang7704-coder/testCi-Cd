declare module '@/components/ui/InputGroup' {
  import * as React from 'react';

  export type InputGroupProps = React.InputHTMLAttributes<HTMLInputElement> & {
    type?: string;
    label?: React.ReactNode;
    placeholder?: string;
    classLabel?: string;
    className?: string;
    classGroup?: string;
    register?: any;
    name?: string;
    readonly?: boolean;
    value?: any;
    error?: any;
    icon?: any;
    disabled?: boolean;
    id?: string;
    horizontal?: boolean;
    validate?: any;
    isMask?: boolean;
    msgTooltip?: boolean;
    description?: React.ReactNode;
    hasicon?: boolean;
    merged?: boolean;
    append?: React.ReactNode;
    prepend?: React.ReactNode;
    options?: any;
  };

  const InputGroup: React.FC<InputGroupProps>;
  export default InputGroup;
}
