import clsx from 'clsx';
import { IconType } from 'react-icons';

interface SocialButtonProps {
  icon: IconType;
  onClick: () => void;
  source: string;
  disabled: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  icon: Icon,
  onClick,
  source,
  disabled,
}) => {
  const iconClassNames = clsx(`
    mr-2
    text-base
  `);

  const buttonClassNames = clsx(
    `
    inline-flex
    items-center
    justify-center
    w-full
    py-1
    rounded
    border
    border-neutral-700
    text-gray-200
    font-light
    transition-colors
    space-x-2`,
    disabled
      ? 'opacity-50 cursor-default bg-zinc-900 outline-0'
      : 'hover:border-neutral-500'
  );

  return (
    <button className={buttonClassNames} onClick={onClick}>
      <Icon className={iconClassNames} />
      Sign in with {source}
    </button>
  );
};

export default SocialButton;
