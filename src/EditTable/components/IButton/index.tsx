import { Button, ButtonProps } from 'antd';
import React, { useCallback, useState } from 'react';

const IButton = (props: ButtonProps) => {
  const { onClick } = props;
  const [isLoading, setIsLoading] = useState(false);

  const innerClick = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      setIsLoading(true);
      try {
        await onClick?.(event);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    },
    [onClick],
  );
  return <Button {...props} loading={isLoading} onClick={innerClick} />;
};

export default IButton;
