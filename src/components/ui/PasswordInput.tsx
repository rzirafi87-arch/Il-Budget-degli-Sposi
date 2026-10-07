"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  labelClassName?: string;
  inputClassName?: string;
};

export function PasswordInput({
  id,
  labelClassName = "block",
  inputClassName = "mt-1 block w-full border px-3 py-2 pr-12",
  ...inputProps
}: PasswordInputProps) {
  const t = useTranslations("runtimeUi.password");
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  const actionLabel = visible ? t("hide") : t("show");

  return (
    <div className={labelClassName}>
      <label htmlFor={inputId}>{t("label")}</label>
      <span className="relative mt-1 block">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          className={inputClassName.replace(/^mt-1\s*/, "")}
        />
        <button
          type="button"
          aria-controls={inputId}
          aria-label={actionLabel}
          aria-pressed={visible}
          title={actionLabel}
          onClick={() => setVisible(current => !current)}
          className="absolute inset-y-0 right-0 grid min-h-11 min-w-11 place-items-center rounded-r-md text-muted-fg hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {visible ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
        </button>
      </span>
    </div>
  );
}
