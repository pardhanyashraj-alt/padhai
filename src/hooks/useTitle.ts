"use client";

import { useEffect } from "react";

/**
 * Custom hook to dynamically update the browser tab title.
 * @param title - The specific page title (e.g., "Schedule")
 * @param absolute - If true, replaces the entire title instead of using the template.
 */
export function useTitle(title: string, absolute = false) {
  useEffect(() => {
    const baseTitle = "EduFlow";
    
    if (absolute) {
      document.title = title;
    } else {
      document.title = `${title} | ${baseTitle}`;
    }
  }, [title, absolute]);
}
