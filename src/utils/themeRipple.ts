import React from 'react';

/**
 * Triggers a silky-smooth circular water-ripple theme transition originating
 * directly from the user's click point using the native View Transitions API.
 */
export function toggleThemeWithRipple(
  event: React.MouseEvent<HTMLElement> | MouseEvent | undefined,
  toggleCallback: () => void
) {
  // Fallback if View Transitions API is not supported or user prefers reduced motion
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // @ts-ignore - View Transitions API standard check
  if (!document.startViewTransition || isReducedMotion) {
    toggleCallback();
    return;
  }

  // Extract click coordinates or fallback to screen center
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;

  // Calculate radius from click point to furthest corner of the viewport
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // @ts-ignore - View Transitions API invocation
  const transition = document.startViewTransition(() => {
    toggleCallback();
  });

  transition.ready.then(() => {
    // Animate expanding circular clip-path on the new theme snapshot
    document.documentElement.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
      ],
      {
        duration: 550,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });
}
