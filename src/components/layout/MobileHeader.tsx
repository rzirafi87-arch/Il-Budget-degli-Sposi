import type { FC } from "react";

interface MobileHeaderProps {
  title: string;
}

const MobileHeader: FC<MobileHeaderProps> = ({ title }) => {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4">
        <button aria-label="Menu" className="rounded p-2">
          ☰
        </button>
        <div className="text-base font-semibold">{title}</div>
        <div className="w-9" />
      </div>
    </div>
  );
};

export default MobileHeader;
