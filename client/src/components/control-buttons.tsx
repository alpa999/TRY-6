import { Button } from "@/components/ui/button";

interface ControlButtonsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onFindNext: () => void;
  onOpenChat: () => void;
  onOpenGames: () => void;
  onOpenDonation: () => void;
  isConnected: boolean;
}

export default function ControlButtons({
  isMuted,
  onToggleMute,
  onFindNext,
  onOpenChat,
  onOpenGames,
  onOpenDonation,
  isConnected
}: ControlButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Mute Button */}
      <Button
        onClick={onToggleMute}
        className={`w-12 h-12 rounded-full p-0 transition-all duration-300 group relative ${
          isMuted ? 'bg-red-500/30 hover:bg-red-500/40' : 'bg-stellar-gray/30 hover:bg-aurora-green/30'
        } backdrop-blur-sm border border-stellar-gray/30`}
        variant="ghost"
      >
        {!isMuted && isConnected && (
          <div className="absolute inset-0 rounded-full bg-aurora-green/20 animate-ping"></div>
        )}
        <svg className="w-4 h-4 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
          {isMuted ? (
            <path d="M16.5 12A4.5 4.5 0 0 0 14.64 8.77L16.15 7.26A6.47 6.47 0 0 1 18.5 12A6.47 6.47 0 0 1 16.15 16.74L14.64 15.23A4.5 4.5 0 0 0 16.5 12ZM19.07 4.93L20.5 6.36L18.6 8.26A8.94 8.94 0 0 1 21 12A8.94 8.94 0 0 1 18.6 15.74L20.5 17.64L19.07 19.07L17.64 17.64A10.94 10.94 0 0 1 12 19A10.94 10.94 0 0 1 6.36 17.64L4.93 19.07L3.5 17.64L5.4 15.74A8.94 8.94 0 0 1 3 12A8.94 8.94 0 0 1 5.4 8.26L3.5 6.36L4.93 4.93L6.36 6.36A10.94 10.94 0 0 1 12 5A10.94 10.94 0 0 1 17.64 6.36L19.07 4.93ZM12 7A5 5 0 0 0 7.64 9.64L9.07 11.07A3 3 0 0 1 12 9A3 3 0 0 1 14.93 11.07L16.36 9.64A5 5 0 0 0 12 7Z"/>
          ) : (
            <path d="M12 2C11.4 2 11 2.4 11 3V11C11 11.6 11.4 12 12 12S13 11.6 13 11V3C13 2.4 12.6 2 12 2ZM19 11C19 15.4 15.4 19 11 19V21C16.5 21 21 16.5 21 11H19ZM17 11C17 13.8 14.8 16 12 16S7 13.8 7 11H5C5 14.9 8.1 18 12 18S19 14.9 19 11H17Z"/>
          )}
        </svg>
      </Button>

      {/* Next Button */}
      <Button
        onClick={onFindNext}
        onTouchStart={(e) => {
          // Prevent double-tap zoom on mobile
          e.preventDefault();
          onFindNext();
        }}
        className="w-16 h-16 rounded-full p-0 bg-gradient-to-br from-cosmic-blue to-cosmic-purple hover:from-cosmic-purple hover:to-cosmic-blue transition-all duration-300 transform hover:scale-105 shadow-lg touch-manipulation"
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 18L8.5 12L4 6V18ZM13 6V18L17.5 12L13 6Z"/>
        </svg>
      </Button>

      {/* Chat Button */}
      <Button
        onClick={onOpenChat}
        disabled={!isConnected}
        className="w-12 h-12 rounded-full p-0 bg-cosmic-blue/30 hover:bg-cosmic-blue/40 backdrop-blur-sm border border-stellar-gray/30 transition-all duration-300 disabled:opacity-30"
        variant="ghost"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/>
        </svg>
      </Button>

      {/* Play Button */}
      <Button
        onClick={onOpenGames}
        className="w-12 h-12 rounded-full p-0 bg-solar-orange/30 hover:bg-solar-orange/40 backdrop-blur-sm border border-stellar-gray/30 transition-all duration-300"
        variant="ghost"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM8.5 7H15.5C16.3 7 17 7.7 17 8.5V10.5C17 11.3 16.3 12 15.5 12H14V22H10V12H8.5C7.7 12 7 11.3 7 10.5V8.5C7 7.7 7.7 7 8.5 7Z"/>
        </svg>
      </Button>

      {/* Donate Button */}
      <Button
        onClick={onOpenDonation}
        className="w-12 h-12 rounded-full p-0 bg-aurora-green/30 hover:bg-aurora-green/40 backdrop-blur-sm border border-stellar-gray/30 transition-all duration-300 animate-pulse-slow"
        variant="ghost"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
        </svg>
      </Button>
    </div>
  );
}
