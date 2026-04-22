declare module '@/components/ui/Card' {
  import * as React from 'react';

  export interface CardProps {
    children?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headerslot?: React.ReactNode;
    className?: string;
    bodyClass?: string;
    noborder?: boolean;
    titleClass?: string;
  }

  const Card: React.FC<CardProps>;
  export default Card;
}
