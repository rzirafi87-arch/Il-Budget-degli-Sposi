import type { FC, ReactNode } from "react";

interface BottomBarProps {
  children: ReactNode;
}

const BottomBar: FC<BottomBarProps> = ({ children }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-md items-center justify-center gap-3 p-3">
        {children}
      </div>
    </div>
  );
};

export default BottomBar;
