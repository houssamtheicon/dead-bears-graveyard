import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type OutputLine = {
  text: string;
  type: 'command' | 'response' | 'error' | 'success' | 'typing';
};

type RewardType = 'OG' | 'WHITELIST' | 'FREE_NFT';

const riddles = [
  { q: 'I am not alive, but I grow. I don\'t have lungs, but I need air. What am I?', a: 'fire' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps' },
  { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a: 'echo' },
  { q: 'What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?', a: 'river' },
];

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
  const [currentRiddle, setCurrentRiddle] = useState<{ q: string; a: string } | null>(null);
  const [riddleReward, setRiddleReward] = useState<{ text: string } | null>(null);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

// Always keep input focused unless typing
useEffect(() => {
  if (!isTyping) {
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }
}, [isTyping, output]);


// Always keep input focused unless typing
useEffect(() => {
  if (!isTyping) {
    inputRef.current?.focus();
  }
}, [isTyping, output]);

  // Generate unique code
  const generateCode = (type: RewardType) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = type === 'OG' ? 'OG' : type === 'WHITELIST' ? 'WL' : 'NFT';
    return `${prefix}-${timestamp}-${random}`;
  };

  const determineReward = (): RewardType => {
    const rand = Math.random() * 100;
    if (rand < 0.7) return 'FREE_NFT';
    if (rand < 67) return 'WHITELIST';
    return 'OG';
  };

  // Typewriter effect
  const typewriterEffect = async (text: string, type: OutputLine['type'] = 'response') => {
    setIsTyping(true);
    setOutput(prev => [...prev, { text: '', type: 'typing' }]);
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setOutput(prev => {
        const newOutput = [...prev];
        newOutput[newOutput.length - 1] = { text: currentText, type: 'typing' };
        return newOutput;
      });
      await new Promise(r => setTimeout(r, 25));
    }

    setOutput(prev => {
      const newOutput = [...prev];
      newOutput[newOutput.length - 1] = { text, type };
      return newOutput;
    });

    setIsTyping(false);
    inputRef.current?.focus();
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
      await typewriterEffect('Once, we were Okay. We lived in the light, followed the rules, and believed in the roadmap.', 'response');
      await typewriterEffect('Then the market crashed. The promises faded. And we died.', 'response');
      await typewriterEffect('From the ashes, Dead Bears rose. No roadmap. No promises. Just truth.', 'response');
      await typewriterEffect('We are the survivors. The builders. The ones who refused to stay buried.', 'response');
    },
    'dig deeper': async () => {
      await typewriterEffect('> Excavating hidden files...', 'response');
      await typewriterEffect('🔍 SNEAK PEEK: The art is ready. The collection breathes in darkness.', 'response');
      await typewriterEffect('Each bear carries the scars of what came before. No two deaths are alike.', 'response');
      await typewriterEffect('Mint date: When the dead decide. Not before.', 'response');
      await typewriterEffect('Supply: Fewer than you think. More than you deserve.', 'response');
    },
    'solve riddle': async () => {
      const riddle = riddles[Math.floor(Math.random() * riddles.length)];
      setCurrentRiddle(riddle);
      await typewriterEffect('> The void poses a question...', 'response');
      await typewriterEffect(riddle.q, 'response');
      await typewriterEffect('(Type your answer below)', 'response');
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
      await typewriterEffect('> Screenshot it if you dare.', 'response');
    },
    clear: async () => {
      setOutput([]);
      await typewriterEffect('> Terminal cleared. The dead await your command.', 'response');
    },
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    setOutput(prev => [...prev, { text: `$ ${cmd}`, type: 'command' }]);

    // Secret mode username
    if (secretMode && !username) {
      if (!trimmedCmd) return;
      setUsername(cmd.trim());
      await typewriterEffect(`> Welcome, ${cmd.trim()}. Now enter the secret word to proceed...`, 'response');
      return;
    }

    // Secret mode secret word
    if (secretMode && username) {
      if (trimmedCmd === 'deadbear' || trimmedCmd === 'dead bear') {
        const rewardType = determineReward();
        const code = generateCode(rewardType);
        setReward({ type: rewardType, code });
        await typewriterEffect('> Access granted. Generating reward...', 'success');
        await typewriterEffect('🎉 CONGRATULATIONS! 🎉', 'success');
        if (rewardType === 'FREE_NFT') await typewriterEffect(`> ${username}, you've unlocked a FREE DEAD BEARS NFT!`, 'success');
        else if (rewardType === 'WHITELIST') await typewriterEffect(`> ${username}, you've been added to the WHITELIST!`, 'success');
        else await typewriterEffect(`> ${username}, you've earned OG status!`, 'success');

        await typewriterEffect(`> Your unique code: ${code}`, 'success');
        await typewriterEffect('> TO CLAIM: Open a ticket in Discord and provide this screenshot.', 'response');
        setSecretMode(false);
      } else {
        await typewriterEffect('> The shadows reject your offering. That is not the word.', 'error');
      }
      return;
    }

    // Riddle answer
    if (currentRiddle) {
      const answer = currentRiddle.a.toLowerCase().replace(/\s+/g, '');
      const userAnswer = trimmedCmd.replace(/\s+/g, '');
      if (userAnswer === answer) {
        await typewriterEffect('Correct! The void acknowledges your wisdom. ✨', 'success');
        await typewriterEffect('You have solved the riddle! 🎉', 'success');

        const text = `I just solved a Dead Bears riddle in the Ritual Terminal! 💀\n\nCheck yours deadbears.xyz/terminal\n\n@theDeadBearsNFT
`;
        setRiddleReward({ text });
      } else {
        await typewriterEffect(`Wrong... The answer was: ${currentRiddle.a}`, 'error');
      }
      setCurrentRiddle(null);
      return;
    }

    // Regular commands
    if (commands[trimmedCmd]) {
      await commands[trimmedCmd]();
    } else if (trimmedCmd === '') {
      return;
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

  const handleShare = (text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono" onClick={() => inputRef.current?.focus()}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 border-b border-green-400/30 pb-4">
          <h1 className="text-2xl font-bold text-green-400">DEAD BEARS RITUAL TERMINAL</h1>
          <p className="text-sm text-green-400/60">deadbears.xyz/terminal</p>
        </div>

        <div className="space-y-1 mb-4 min-h-[60vh] overflow-y-auto">
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

        {/* Secret / riddle rewards */}
        {reward && (
          <div className="mb-4 p-4 border border-green-400 bg-green-400/5">
            <Button onClick={() => handleShare(`I just unlocked a ${reward.type} reward in Dead Bears Ritual Terminal! 💀\n\nCheck yours at deadbears.xyz/terminal\n\n@theDeadBearsNFT
`)} className="w-full bg-green-400 text-black hover:bg-green-500 font-bold">
              📢 SHARE ON TWITTER
            </Button>
          </div>
        )}

        {riddleReward && (
          <div className="mb-4 p-4 border border-green-400 bg-green-400/5">
            <Button onClick={() => { handleShare(riddleReward.text); setRiddleReward(null); }} className="w-full bg-green-400 text-black hover:bg-green-500 font-bold">
              📢 SHARE YOUR RIDDLE SUCCESS ON TWITTER
            </Button>
          </div>
        )}

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
