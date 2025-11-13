import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Copy, Check, Twitter, HelpCircle, Home } from 'lucide-react';

type RewardType = 'OG' | 'WL';

const secretWords = [
  'obitus', 'revenant', 'sigilium', 'ashenfoil', 'marrowroot',
  'threshold', 'limina', 'duskbridge', 'hollowgate', 'nethercall',
  'rite', 'hymn', 'talon', 'voidkey', 'hush',
  'soulwax', 'tombdrop', 'echojar', 'cryptnote', 'nightseed'
];

const loreFragments = [
  'In death, we find truth. In fire, we find rebirth.',
  'The dead do not sleep. They wait. They watch. They whisper.',
  'Every bear that falls rises stronger in the void.',
  'The ritual has begun. Only the worthy may proceed.',
  'Beyond the veil lies the truth. Beyond truth lies power.',
  'We are the echoes of what was. We are the promise of what comes.',
  'The graveyard is not an end. It is a beginning.',
  'Speak the words, and the shadows will answer.'
];

const Terminal = () => {
  const [input, setInput] = useState('');
  const [currentLore, setCurrentLore] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [reward, setReward] = useState<{ type: RewardType; code: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [remainingWL, setRemainingWL] = useState(200);
  const [showHelp, setShowHelp] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate lore on mount
  useEffect(() => {
    const randomLore = loreFragments[Math.floor(Math.random() * loreFragments.length)];
    setCurrentLore(randomLore);
  }, []);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Animate charge progress based on input length
  useEffect(() => {
    const progress = Math.min((input.length / 15) * 100, 100);
    setChargeProgress(progress);
  }, [input]);

  // Generate unique code
  const generateCode = (type: RewardType) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RITUAL-${timestamp}-${random}`;
  };

  // Determine reward (22 OG or WL spot)
  const determineReward = (): RewardType => {
    const rand = Math.random() * 100;
    if (rand < 10 && remainingWL > 0) {
      return 'OG'; // 10% chance for OG
    }
    return 'WL'; // 90% chance for WL
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = input.trim().toLowerCase();

    // Log attempt
    console.log(`[Analytics] Attempt #${attempts + 1}: "${trimmedInput}"`);

    // Throttle check
    if (isThrottled) {
      setErrorMessage('The shadows grow weary... Wait a moment before trying again. 💀');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (attempts >= 5) {
      setIsThrottled(true);
      setErrorMessage('Too many attempts. The ritual has closed for now. Try again in 60 seconds.');
      setTimeout(() => {
        setIsThrottled(false);
        setAttempts(0);
        setErrorMessage('');
      }, 60000);
      return;
    }

    // Check secret word
    if (secretWords.includes(trimmedInput)) {
      const rewardType = determineReward();
      const code = generateCode(rewardType);
      
      setReward({ type: rewardType, code });
      setShowModal(true);
      setInput('');
      setChargeProgress(0);

      // Update remaining WL if WL was awarded
      if (rewardType === 'WL') {
        setRemainingWL(prev => Math.max(0, prev - 1));
      }

      // Log success
      console.log(`[Analytics] SUCCESS: Word "${trimmedInput}" → ${rewardType} → Code: ${code}`);
    } else {
      setAttempts(prev => prev + 1);
      setErrorMessage('The void rejects your offering... That word holds no power here. 💀');
      setTimeout(() => setErrorMessage(''), 3000);
      
      // Log failed attempt
      console.log(`[Analytics] FAILED: "${trimmedInput}" not recognized`);
    }
  };

  const copyCode = () => {
    if (reward) {
      navigator.clipboard.writeText(reward.code);
      setCopiedCode(true);
      toast({
        title: "Code Copied! 🔮",
        description: "Now share it on Twitter to reveal your reward.",
      });
      setTimeout(() => setCopiedCode(false), 2000);
      
      // Log copy action
      console.log(`[Analytics] Code copied: ${reward.code}`);
    }
  };

  const shareOnTwitter = () => {
    if (reward) {
      const tweetText = `I just activated the Ritual Terminal — here's my claim code: ${reward.code} 🔮\nGet yours here: https://www.deadbears.xyz/terminal \n@theDeadBearsNFT #RitualTerminal #DeadBears`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(url, '_blank');
      
      // Log share action
      console.log(`[Analytics] Twitter share clicked for ${reward.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-mono">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-900 opacity-90" />
      
      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Pulsing Runes Border */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-emerald-400/20 text-6xl animate-pulse">☥</div>
        <div className="absolute top-4 right-4 text-emerald-400/20 text-6xl animate-pulse" style={{ animationDelay: '1s' }}>☧</div>
        <div className="absolute bottom-4 left-4 text-emerald-400/20 text-6xl animate-pulse" style={{ animationDelay: '2s' }}>⚚</div>
        <div className="absolute bottom-4 right-4 text-emerald-400/20 text-6xl animate-pulse" style={{ animationDelay: '3s' }}>⚛</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-400/60 hover:text-emerald-400 transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-sm">Return Home</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1 tracking-wider">
              RITUAL TERMINAL
            </h1>
            <p className="text-xs text-emerald-400/60">WL SPOTS REMAINING: {remainingWL}/200</p>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help</span>
          </button>
        </div>

        {/* Terminal Frame */}
        <div className="w-full max-w-2xl bg-zinc-950/80 border-2 border-emerald-400/30 rounded-lg p-8 md:p-12 shadow-[0_0_30px_rgba(52,211,153,0.2)] backdrop-blur-sm">
          {/* Lore Text */}
          <div className="mb-8 text-center">
            <p className="text-emerald-400/80 text-sm md:text-base italic leading-relaxed">
              "{currentLore}"
            </p>
          </div>

          {/* Animated Sigil */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24">
              {/* Sigil Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-2 border-emerald-400/30 rounded-full animate-pulse" />
                <div className="absolute w-16 h-16 border-2 border-emerald-400/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              
              {/* Progress Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="rgba(52, 211, 153, 0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="rgba(52, 211, 153, 0.8)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - chargeProgress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400 text-2xl">
                ☠
              </div>
            </div>
          </div>

          {/* Input Field */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-emerald-400 text-sm mb-3 text-center tracking-wider">
                WHISPER THE WORD
              </label>
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThrottled}
                className="w-full bg-black border-2 border-emerald-400/50 text-emerald-400 text-center text-xl py-6 font-mono focus:border-emerald-400 focus:ring-emerald-400 focus:ring-2 placeholder:text-emerald-400/30 transition-all"
                placeholder="..."
                autoComplete="off"
                spellCheck="false"
              />
              <div className="absolute right-4 top-12 text-emerald-400 animate-pulse">▊</div>
            </div>

            {errorMessage && (
              <p className="text-red-400 text-sm text-center animate-fade-in">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={!input.trim() || isThrottled}
              className="w-full bg-emerald-400 text-black hover:bg-emerald-500 font-bold text-lg py-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]"
            >
              {isThrottled ? 'RITUAL COOLING...' : 'INVOKE THE RITUAL'}
            </Button>
          </form>

          {/* Hint */}
          <p className="text-emerald-400/40 text-xs text-center mt-6">
            Seek the words in the shadows... Follow the whispers... 🔮
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-emerald-400/30 text-xs text-center">
          The dead are listening... Are you worthy?
        </p>
      </div>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-zinc-950 border-2 border-emerald-400 max-w-md">
          <div className="text-center space-y-6 py-4">
            {/* Animated Rune */}
            <div className="text-6xl animate-pulse text-emerald-400">
              ✨ ☠ ✨
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                RITUAL ACCEPTED
              </h2>
              <p className="text-white text-lg">
                You've unlocked:{' '}
                <span className="text-emerald-400 font-bold">
                  {reward?.type === 'OG' ? '22 OG' : 'WL ENTRY'}
                </span>
              </p>
            </div>

            {/* Claim Code */}
            <div className="bg-black border border-emerald-400/50 rounded p-4">
              <p className="text-emerald-400/60 text-xs mb-2">YOUR CLAIM CODE:</p>
              <p className="text-emerald-400 text-xl font-mono font-bold break-all">
                {reward?.code}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={copyCode}
                className="w-full bg-emerald-400 text-black hover:bg-emerald-500 font-bold"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Code Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              <Button
                onClick={shareOnTwitter}
                className="w-full bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] font-bold"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-left bg-emerald-400/5 border border-emerald-400/20 rounded p-4 text-sm space-y-3">
              <p className="text-white">
                Post this code on Twitter (public) so our team can verify it and assign your {reward?.type === 'OG' ? 'OG' : 'WL'} automatically.
              </p>
              <p className="text-white">
                Then join the Discord to finalize the claim:
              </p>
              <a
                href="https://discord.com/invite/JBApX5VPzN"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#5865F2] text-white py-3 rounded font-bold hover:bg-[#4752c4] transition-colors"
              >
                Join Discord
              </a>
              <p className="text-emerald-400/60 text-xs text-center">
                Need help? Click the Help button in the terminal.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-zinc-950 border-2 border-emerald-400 max-w-md">
          <div className="space-y-4 py-4">
            <h2 className="text-2xl font-bold text-emerald-400 text-center">
              How It Works
            </h2>
            
            <div className="space-y-4 text-sm text-white">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Find Secret Words</p>
                  <p className="text-white/80">
                    Discover secret words hidden in our Twitter, Discord, and NFT lore.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Submit the Word</p>
                  <p className="text-white/80">
                    Enter the word in the terminal to receive your unique claim code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Post on Twitter</p>
                  <p className="text-white/80">
                    Share your claim code publicly on Twitter so we can verify it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-bold text-emerald-400">Join Discord</p>
                  <p className="text-white/80">
                    Join our Discord and get your OG/WL status assigned automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-400/10 border border-emerald-400/30 rounded p-4 mt-6">
              <p className="text-xs text-emerald-400/80">
                <span className="font-bold">Rewards:</span> 22 OG spots (rare) or 200 WL entries (common). Each code is single-use and verified through your Twitter post.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
