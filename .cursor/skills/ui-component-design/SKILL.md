---
name: ui-component-design
description: Use when building or redesigning UI components by researching proven patterns before implementation.
---
# UI Component Design Skill

## Purpose

Use this skill whenever building, improving, or redesigning user interface elements in a React, Next.js, full stack, or web application project.

The goal is to make UI work faster, more consistent, more accessible, and more visually polished by researching proven component patterns before implementation.

## When To Use This Skill

Use this skill when working on:

- New components
- Existing component redesigns
- Page layouts
- Dashboards
- Hero sections
- Forms
- Cards
- Navigation
- Sidebars
- Modals
- Data tables
- Empty states
- Loading states
- Backgrounds
- Motion and animation
- Responsive layouts
- Design system cleanup

## Research Process

Before implementing:

1. Identify the exact UI pattern needed.
2. Search the approved UI libraries for similar patterns.
3. Compare at least two references when possible.
4. Select the pattern that best fits the current project.
5. Adapt the selected pattern to the project’s design system.
6. Implement using existing components and tokens first.
7. Verify accessibility, responsiveness, and maintainability.

## Design System Alignment

Before adding new styling, inspect the project for:

- CSS variables
- Tailwind theme configuration
- Global styles
- Existing components
- Existing layout primitives
- Existing animation utilities
- Existing dark mode behavior
- Existing typography
- Existing spacing conventions
- Existing accessibility patterns

Do not create new design tokens unless the existing system cannot support the required design.

## Component Quality Checklist

A completed UI component should be:

- Reusable
- Typed correctly
- Accessible
- Responsive
- Visually consistent
- Easy to maintain
- Compatible with existing project architecture
- Free of unnecessary dependencies
- Clear in naming and file placement

## Accessibility Checklist

Verify:

- Semantic HTML is used.
- Interactive elements are keyboard accessible.
- Focus states are visible.
- Buttons use button elements.
- Links use anchor elements when navigating.
- Inputs have labels.
- Icons have accessible names or are hidden from screen readers.
- Color contrast is readable.
- Motion does not block usability.

## Responsive Checklist

Verify:

- Layout works on mobile.
- Layout works on tablet.
- Layout works on desktop.
- Content does not overflow.
- Navigation remains usable.
- Modals and drawers work on small screens.
- Touch targets are large enough.
- Text remains readable.

## Motion Guidelines

Use motion only when it improves clarity, feedback, or flow.

Good uses:

- Button feedback
- Modal transitions
- Step progression
- Loading transitions
- Microinteractions
- Revealing hierarchy

Avoid:

- Excessive decorative animation
- Animation that distracts from content
- Motion that reduces readability
- Long transitions
- Unnecessary animation dependencies

## Output Expectations

When implementing UI, provide:

- The completed component code
- Any updated styling
- Any required imports
- Any required dependency notes
- A short note identifying the design reference used
- A short explanation of how the implementation matches the project design system