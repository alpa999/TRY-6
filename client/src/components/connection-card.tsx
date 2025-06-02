interface ConnectionCardProps {
  connectionStatus: 'disconnected' | 'searching' | 'connected';
  partnerInfo?: {
    country: string;
    flag: string;
  };
}

export default function ConnectionCard({ connectionStatus, partnerInfo }: ConnectionCardProps) {
  return (
    <div className="bg-space-gray/30 backdrop-blur-lg border border-stellar-gray/20 rounded-3xl p-6 mb-6 text-center animate-float">
      {connectionStatus === 'searching' && (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cosmic-blue to-cosmic-purple rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Searching the cosmos...</h2>
          <p className="text-stellar-gray">Finding your next conversation partner</p>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cosmic-blue rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-cosmic-purple rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-aurora-green rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === 'connected' && partnerInfo && (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-aurora-green to-cosmic-blue rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM18.39 14.56C16.71 13.7 14.53 13 12 13S7.29 13.7 5.61 14.56C4.61 15.07 4 16.1 4 17.22V20H20V17.22C20 16.1 19.39 15.07 18.39 14.56Z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Connected to Explorer</h2>
          <div className="flex items-center justify-center gap-2 text-stellar-gray">
            <span className="text-xl">{partnerInfo.flag}</span>
            <span>{partnerInfo.country}</span>
          </div>
        </div>
      )}

      {connectionStatus === 'disconnected' && (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-stellar-gray to-space-gray rounded-full flex items-center justify-center mb-4 animate-float">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Ready to Launch</h2>
          <p className="text-stellar-gray">Click "Next" to find someone to talk with</p>
          <div className="text-xs text-stellar-gray mt-4">
            Floating through space... waiting for a signal
          </div>
        </div>
      )}
    </div>
  );
}
