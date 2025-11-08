"use client";


import React from "react";
import { useTranslations } from "next-intl";

export type WeddingTradition = {
  country?: string | null;
  rito?: string | null;
  stile?: string | null;
  colori?: string | null;
  regali?: string | null;
  durata?: string | null;
  festa?: string | null;
  usanze?: string | null;
};

export default function WeddingTraditionInfo({ tradition }: { tradition?: WeddingTradition | null }) {
  const t = useTranslations();
  if (!tradition) return null;
  const hasDetails = tradition.rito || tradition.stile || tradition.colori || tradition.regali || tradition.durata || tradition.festa || tradition.usanze;
  if (!hasDetails) return null;
  return (
    <section className="bg-white/80 rounded-xl p-6 mb-8 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-3">
        🎎 {t("traditions.title", { country: tradition.country || "" })}
      </h2>
      <div className="space-y-2 text-sm text-gray-800">
        {tradition.rito && (
          <p><span className="mr-1">🎎</span><strong>{t("traditions.ritoLabel")}</strong> {tradition.rito}</p>
        )}
        {tradition.stile && (
          <p><span className="mr-1">🎨</span><strong>{t("traditions.stileLabel")}</strong> {tradition.stile}</p>
        )}
        {tradition.colori && (
          <p><span className="mr-1">🌈</span><strong>{t("traditions.coloriLabel")}</strong> {tradition.colori}</p>
        )}
        {tradition.regali && (
          <p><span className="mr-1">🎁</span><strong>{t("traditions.regaliLabel")}</strong> {tradition.regali}</p>
        )}
        {tradition.durata && (
          <p><span className="mr-1">⏳</span><strong>{t("traditions.durataLabel")}</strong> {tradition.durata}</p>
        )}
        {tradition.festa && (
          <p><span className="mr-1">🍽️</span><strong>{t("traditions.festaLabel")}</strong> {tradition.festa}</p>
        )}
        {tradition.usanze && (
          <p><span className="mr-1">✨</span><strong>{t("traditions.usanzeLabel")}</strong> {tradition.usanze}</p>
        )}
      </div>
    </section>
  );
}

