declare module '@/components/ui/Textarea' {
  import * as React from 'react';

  export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: React.ReactNode;
    placeholder?: string;
    classLabel?: string;
    className?: string;
    classGroup?: string;
    register?: any;
    name?: string;
    readonly?: boolean;
    dvalue?: any;
    value?: any;
    error?: any;
    icon?: any;
    disabled?: boolean;
    id?: string;
    horizontal?: boolean;
    validate?: any;
    msgTooltip?: boolean;
    description?: React.ReactNode;
    cols?: number;
    row?: number;
  };

  const Textarea: React.FC<TextareaProps>;
  export default Textarea;
}
