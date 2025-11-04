"use client";

import { useEffect } from "react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch
        ) {
          event.preventDefault();
          shortcut.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Predefined shortcuts for common actions
export const createShortcuts = (actions: {
  onSearch?: () => void;
  onCompose?: () => void;
  onHelp?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}): Shortcut[] => {
  const shortcuts: Shortcut[] = [];

  if (actions.onSearch) {
    shortcuts.push({
      key: "/",
      action: actions.onSearch,
      description: "Focus search",
    });
  }

  if (actions.onCompose) {
    shortcuts.push({
      key: "n",
      action: actions.onCompose,
      description: "New post",
    });
  }

  if (actions.onHelp) {
    shortcuts.push({
      key: "?",
      shift: true,
      action: actions.onHelp,
      description: "Show shortcuts",
    });
  }

  if (actions.onNext) {
    shortcuts.push({
      key: "j",
      action: actions.onNext,
      description: "Next item",
    });
  }

  if (actions.onPrevious) {
    shortcuts.push({
      key: "k",
      action: actions.onPrevious,
      description: "Previous item",
    });
  }

  return shortcuts;
};
