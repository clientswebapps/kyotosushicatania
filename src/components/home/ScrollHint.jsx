import { ChevronDown } from 'lucide-react';

const ScrollHint = ({ targetId = 'menu-preview', text = "Scroll to discover" }) => {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="scroll-hint"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Scroll down to explore"
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <span className="scroll-hint__text">{text}</span>
      <div className="scroll-hint__arrow">
        <ChevronDown />
        <ChevronDown />
      </div>
      <div className="scroll-hint__pulse" />
    </div>
  );
};

export default ScrollHint;
