// components/ui/table.js
export function Table({ className = '', ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
    </div>
  );
}

export function TableHeader({ ...props }) {
  return <thead {...props} />;
}

export function TableBody({ ...props }) {
  return <tbody {...props} />;
}

export function TableFooter({ ...props }) {
  return <tfoot {...props} />;
}

export function TableRow({ className = '', ...props }) {
  return (
    <tr
      className={`border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = '', ...props }) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = '', ...props }) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  );
}

export function TableCaption({ className = '', ...props }) {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`} {...props} />
  );
}
