// components/ui/separator.js
export function Separator({ orientation = 'horizontal', className = '', ...props }) {
  return orientation === 'horizontal' ? (
    <hr className={`shrink-0 bg-border h-[1px] w-full ${className}`} {...props} />
  ) : (
    <hr className={`shrink-0 bg-border h-full w-[1px] ${className}`} {...props} />
  );
}

export default Separator;
