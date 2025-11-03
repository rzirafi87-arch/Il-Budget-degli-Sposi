"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getBrowserClient } from "@/lib/supabaseBrowser";

type FavoriteItemType = "supplier" | "location" | "church";

type FavoriteRecord = {
  id: string;
  item_type: FavoriteItemType;
  item_id: string;
};

type ToggleOptions = {
  name?: string;
  addMessage?: string;
  removeMessage?: string;
};

type FavoriteMap = Record<string, string>;
type PendingState = Record<string, boolean>;

const supabase = getBrowserClient();

export function useFavorites(itemType: FavoriteItemType) {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteMap>({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingState>({});

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setFavorites({});
        return;
      }

      const res = await fetch("/api/my/favorites", {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Impossibile recuperare i preferiti");
      }

      const json = await res.json();
      const next: FavoriteMap = {};

      (json.favorites as FavoriteRecord[] | undefined)?.forEach((fav) => {
        if (fav.item_type === itemType && fav.item_id) {
          next[fav.item_id] = fav.id;
        }
      });

      setFavorites(next);
    } catch (error) {
      console.error("Favorites load error", error);
      showToast("Errore durante il caricamento dei preferiti", "error");
    } finally {
      setLoading(false);
    }
  }, [itemType, showToast]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (itemId: string) => Boolean(favorites[itemId]),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (itemId: string, options?: ToggleOptions) => {
      setPending((prev) => ({ ...prev, [itemId]: true }));

      try {
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;

        if (!jwt) {
          showToast("Accedi per salvare i preferiti", "info");
          return;
        }

        const favoriteId = favorites[itemId];

        if (favoriteId) {
          const res = await fetch(`/api/my/favorites?id=${favoriteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${jwt}` },
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Errore durante la rimozione dai preferiti");
          }

          setFavorites((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });

          showToast(
            options?.removeMessage ||
              `${options?.name ?? "Elemento"} rimosso dai preferiti`,
            "info",
          );
        } else {
          const res = await fetch("/api/my/favorites", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ item_type: itemType, item_id: itemId }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Errore durante il salvataggio nei preferiti");
          }

          const json = await res.json();
          const record = json.favorite as FavoriteRecord | undefined;

          setFavorites((prev) => ({
            ...prev,
            [itemId]: record?.id ?? itemId,
          }));

          showToast(
            options?.addMessage ||
              `${options?.name ?? "Elemento"} aggiunto ai preferiti`,
            "success",
          );
        }
      } catch (error) {
        console.error("Favorite toggle error", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Errore durante la gestione dei preferiti",
          "error",
        );
      } finally {
        setPending((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }
    },
    [favorites, itemType, showToast],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
    pending,
    reload: loadFavorites,
  };
}

