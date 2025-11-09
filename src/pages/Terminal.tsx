import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OutputLine = {
  text: string;
  type: 'command' | 'response' | 'error' | 'success' | 'typing';
};

type RewardType = 'OG' | 'WHITELIST' | 'FREE_NFT';

const Terminal = () => {
  const [output, setOutput] = useState<OutputLine[]>([
    { text: '> DEAD BEARS RITUAL TERMINAL v1.0', type: 'response' },
    { text: '> Initializing...', type: 'response' },
    { text: '> Connection established. The dead are listening.', type: 'success' },
    { text: '> Type "help" to see available commands.', type: 'response' },
    { text: '', type: 'response' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [secretMode, setSecretMode] = useState(false);
  const [username, setUsername] = useState('');
  const [reward, setReward] = useState<{ type: RewardType; code: string } | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate unique code based on reward type
  const generateCode = (type: RewardType): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = type === 'OG' ? 'OG' : type === 'WHITELIST' ? 'WL' : 'NFT';
    return `${prefix}-${timestamp}-${random}`;
  };

  // Determine reward type (weighted random)
  const determineReward = (): RewardType => {
    const rand = Math.random() * 100;
    if (rand < 0.7) return 'FREE_NFT'; // 0.7% chance (5 out of 671)
    if (rand < 67) return 'WHITELIST'; // 66.3% chance (444 out of 671)
    return 'OG'; // 33% chance (222 out of 671)
  };

  // Typewriter effect
  const typewriterEffect = async (text: string, type: OutputLine['type'] = 'response') => {
    setIsTyping(true);
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setOutput(prev => {
        const newOutput = [...prev];
        if (newOutput[newOutput.length - 1]?.type === 'typing') {
          newOutput[newOutput.length - 1] = { text: currentText, type: 'typing' };
        } else {
          newOutput.push({ text: currentText, type: 'typing' });
        }
        return newOutput;
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setOutput(prev => {
      const newOutput = [...prev];
      newOutput[newOutput.length - 1] = { text, type };
      return newOutput;
    });
    setIsTyping(false);
  };

  // Command handlers
  const commands: Record<string, () => Promise<void>> = {
    help: async () => {
      await typewriterEffect('> Available commands:', 'response');
      await typewriterEffect('  wake the dead - Reveal the origin story', 'response');
      await typewriterEffect('  dig deeper - Uncover hidden truths', 'response');
      await typewriterEffect('  solve riddle - Test your wit against the void', 'response');
      await typewriterEffect('  secret - Enter the inner circle... if you dare', 'response');
      await typewriterEffect('  graveyard - Visit the collection', 'response');
      await typewriterEffect('  burn - A hidden truth awaits...', 'response');
      await typewriterEffect('  clear - Clear the terminal', 'response');
    },
    
    'wake the dead': async () => {
      await typewriterEffect('> Accessing archive...', 'response');
      await typewriterEffect('', 'response');
      await typewriterEffect('Once, we were Okay. We lived in the light, followed the rules, and believed in the roadmap.', 'response');
      await typewriterEffect('Then the market crashed. The promises faded. And we died.', 'response');
      await typewriterEffect('', 'response');
      await typewriterEffect('But death was not the end. It was the beginning.', 'response');
      await typewriterEffect('From the ashes of false hope, Dead Bears rose. No roadmap. No promises. Just truth.', 'response');
      await typewriterEffect('We are the survivors. The builders. The ones who refused to stay buried.', 'response');
    },
    
    'dig deeper': async () => {
      await typewriterEffect('> Excavating hidden files...', 'response');
      await typewriterEffect('', 'response');
      await typewriterEffect('🔍 SNEAK PEEK: The art is ready. The collection breathes in darkness.', 'response');
      await typewriterEffect('Each bear carries the scars of what came before. No two deaths are alike.', 'response');
      await typewriterEffect('', 'response');
      await typewriterEffect('Mint date: When the dead decide. Not before.', 'response');
      await typewriterEffect('Supply: Fewer than you think. More than you deserve.', 'response');
    },
    
    'solve riddle': async () => {
      const riddles = [
        { q: 'I am not alive, but I grow. I don\'t have lungs, but I need air. What am I?', a: 'Fire' },
        { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
        { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a: 'An echo' },
        { q: 'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?', a: 'A river' },
      ];
      const riddle = riddles[Math.floor(Math.random() * riddles.length)];
      await typewriterEffect('> The void poses a question...', 'response');
      await typewriterEffect('', 'response');
      await typewriterEffect(riddle.q, 'response');
      await typewriterEffect('', 'response');
      // await typewriterEffect(`(The answer is: ${riddle.a})`, 'success');
    },
    
    secret: async () => {
      if (!secretMode) {
        await typewriterEffect('> Entering secure channel...', 'response');
        await typewriterEffect('> First, identify yourself. What is your Discord username?', 'response');
        setSecretMode(true);
      }
    },

    graveyard: async () => {
      await typewriterEffect('> Opening portal to the graveyard...', 'response');
      await typewriterEffect('> Redirecting in 2 seconds...', 'success');
      setTimeout(() => {
        window.location.href = '/#gallery';
      }, 2000);
    },

    burn: async () => {
      await typewriterEffect('> 🔥 EASTER EGG UNLOCKED 🔥', 'success');
      await typewriterEffect('> "In death, we find truth. In fire, we find rebirth."', 'response');
      await typewriterEffect('> The first 100 bears to burn their Okay Bears will receive a special airdrop.', 'response');
      await typewriterEffect('> This message will self-destruct. Screenshot it if you dare.', 'response');
    },

    clear: async () => {
      setOutput([]);
      await typewriterEffect('> Terminal cleared. The dead await your command.', 'response');
    },
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add command to output
    setOutput(prev => [...prev, { text: `$ ${cmd}`, type: 'command' }]);
    
    // Handle secret mode (username entry)
    if (secretMode && !username) {
      setUsername(cmd.trim());
      await typewriterEffect(`> Welcome, ${cmd.trim()}. Now enter the secret word to proceed...`, 'response');
      return;
    }
    
    // Handle secret mode (secret word entry)
    if (secretMode && username) {
      if (trimmedCmd === 'deadbear' || trimmedCmd === 'dead bear') {
        const rewardType = determineReward();
        const code = generateCode(rewardType);
        setReward({ type: rewardType, code });
        
        await typewriterEffect('> Access granted. Generating reward...', 'success');
        await typewriterEffect('', 'response');
        await typewriterEffect('🎉 CONGRATULATIONS! 🎉', 'success');
        await typewriterEffect('', 'response');
        
        if (rewardType === 'FREE_NFT') {
          await typewriterEffect(`> ${username}, you've unlocked a FREE DEAD BEARS NFT!`, 'success');
        } else if (rewardType === 'WHITELIST') {
          await typewriterEffect(`> ${username}, you've been added to the WHITELIST!`, 'success');
        } else {
          await typewriterEffect(`> ${username}, you've earned OG status!`, 'success');
        }
        
        await typewriterEffect('', 'response');
        await typewriterEffect(`> Your unique code: ${code}`, 'success');
        await typewriterEffect('', 'response');
        await typewriterEffect('> TO CLAIM: Open a ticket in Discord and provide this screenshot.', 'response');
        await typewriterEffect('> Share your victory with the world using the button below! 💀', 'response');
        
        setSecretMode(false);
      } else {
        await typewriterEffect('> The shadows reject your offering. That is not the word.', 'error');
        await typewriterEffect('> (Hint: It\'s in our name...)', 'response');
      }
      return;
    }
    
    // Handle regular commands
    if (commands[trimmedCmd]) {
      await commands[trimmedCmd]();
    } else if (trimmedCmd === '') {
      // Empty command, do nothing
    } else {
      await typewriterEffect(`> The shadows do not understand "${cmd}"... 💀`, 'error');
      await typewriterEffect('> Type "help" to see available commands.', 'response');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      handleCommand(input);
      setInput('');
    }
  };

  const handleShare = () => {
    if (!reward || !username) return;
    
    const rewardText = reward.type === 'FREE_NFT' 
      ? 'FREE NFT' 
      : reward.type === 'WHITELIST' 
      ? 'WHITELIST spot' 
      : 'OG status';
    
    const text = `I just unlocked ${rewardText} in the Dead Bears Ritual Terminal! 💀\n\nCheck yours at deadbears.xyz/terminal\n\n#DeadBearsNFT #SolanaNFT`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-black text-green-400 p-4 font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 border-b border-green-400/30 pb-4">
          <h1 className="text-2xl font-bold text-green-400">DEAD BEARS RITUAL TERMINAL</h1>
          <p className="text-sm text-green-400/60">deadbears.xyz/terminal</p>
        </div>

        {/* Output area */}
        <div className="space-y-1 mb-4 min-h-[60vh]">
          {output.map((line, i) => (
            <div 
              key={i}
              className={`
                ${line.type === 'command' ? 'text-white font-bold' : ''}
                ${line.type === 'error' ? 'text-red-400' : ''}
                ${line.type === 'success' ? 'text-yellow-400' : ''}
                ${line.type === 'typing' ? 'text-green-400' : ''}
              `}
            >
              {line.text}
            </div>
          ))}
          <div ref={outputEndRef} />
        </div>

        {/* Reward share button */}
        {reward && (
          <div className="mb-4 p-4 border border-green-400 bg-green-400/5">
            <Button 
              onClick={handleShare}
              className="w-full bg-green-400 text-black hover:bg-green-500 font-bold"
            >
              📢 SHARE ON TWITTER
            </Button>
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-white">$</span>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-black border-green-400/30 text-green-400 font-mono focus:border-green-400 focus:ring-green-400"
            placeholder={secretMode && !username ? "Enter your Discord username..." : secretMode ? "Enter secret word..." : "Type a command..."}
            autoComplete="off"
            spellCheck="false"
          />
          <span className="animate-pulse text-green-400">▊</span>
        </form>

        {/* Instructions */}
        <div className="mt-8 text-xs text-green-400/40 text-center space-y-1">
          <p>Click anywhere to focus the terminal</p>
          <p>Type "help" to see available commands</p>
          <p className="text-green-400/60">💀 The dead are waiting... 💀</p>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
