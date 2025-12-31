import React from "react";
import clsx from "clsx";

/*
====================================================
UI TABLE – STABIELE PURE JS IMPLEMENTATIE
====================================================
- GEEN TypeScript
- GEEN generics
- GEEN forwardRef
- GEEN build-risico
- VOLLEDIG compatibel met Next.js 14
====================================================
*/

export function Table({ className, children, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={clsx("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={clsx("[&_tr]:border-b", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={clsx("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableFooter({ className, children, ...props }) {
  return (
    <tfoot
      className={clsx(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={clsx(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={clsx(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={clsx("p-4 align-middle", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableCaption({ className, children, ...props }) {
  return (
    <caption
      className={clsx("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </caption>
  );
}
