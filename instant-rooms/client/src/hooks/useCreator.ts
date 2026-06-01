import { useMemo } from "react";

const CREATOR_PREFIX = "creator_";

/** Returns whether the current browser is the creator of the given room. */
export function useCreator(roomCode: string | undefined): {
  isCreator: boolean;
  creatorToken: string | null;
  storeToken: (token: string) => void;
} {
  const upperCode = (roomCode ?? "").toUpperCase();
  const key = `${CREATOR_PREFIX}${upperCode}`;

  const creatorToken = useMemo(() => {
    if (!upperCode) return null;
    return localStorage.getItem(key);
  }, [key, upperCode]);

  const isCreator = Boolean(creatorToken);

  const storeToken = (token: string) => {
    localStorage.setItem(key, token);
  };

  return { isCreator, creatorToken, storeToken };
}
