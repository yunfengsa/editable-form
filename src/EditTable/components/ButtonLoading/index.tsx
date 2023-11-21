import { Button, ButtonProps } from 'antd';
import React, { useCallback, useState } from 'react';

/** 带有加载态的按钮 */
export default (props: ButtonProps) => {
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

  return <Button loading={isLoading} {...props} onClick={innerClick} />;
};
