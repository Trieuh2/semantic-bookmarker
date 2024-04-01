import clsx from "clsx";
import Link from "next/link";
import { IconType } from "react-icons";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: IconType;
  count?: number | null;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  label,
  icon: Icon,
  count,
}) => {
  return (
    <Link
      href={href}
      className={clsx(
        `
          flex
          items-center
          gap-x-3
          pl-4
          py-1
          text-sm
          leading-6
          text-white
          hover:bg-neutral-700
          transition-colors
          duration-100
          `
      )}
    >
      <Icon />
      <span>{label}</span>
      {count !== null && <span>{count}</span>}
    </Link>
  );
};

export default SidebarItem;
