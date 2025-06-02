import { useState } from "react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  if (!isOpen) return null;

  const donationAmounts = [
    { amount: 5, label: 'Coffee', description: '☕ Fuel our team' },
    { amount: 15, label: 'Fuel', description: '🚀 Keep servers running' },
    { amount: 50, label: 'Rocket', description: '🌟 Boost development' }
  ];

  const handleDonation = () => {
    if (selectedAmount) {
      // Mock PayPal integration
      window.open(`https://paypal.me/spacetalk/${selectedAmount}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-emerald-400">💝 Support SpaceTalk</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-center py-2">
            <p className="text-gray-400 text-sm">Keep SpaceTalk free for everyone</p>
          </div>

          {/* Donation Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {donationAmounts.map((option) => (
              <button
                key={option.amount}
                onClick={() => setSelectedAmount(option.amount)}
                className={`bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors ${
                  selectedAmount === option.amount ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
              >
                <div className="text-lg font-semibold text-white">${option.amount}</div>
                <div className="text-xs text-gray-400">{option.label}</div>
              </button>
            ))}
          </div>

          <div className="text-center py-2">
            <p className="text-xs text-gray-400">
              {selectedAmount ? donationAmounts.find(a => a.amount === selectedAmount)?.description : 'Choose amount to support us'}
            </p>
          </div>

          <button
            onClick={handleDonation}
            disabled={!selectedAmount}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Donate via PayPal
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">Secure payments via PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
}