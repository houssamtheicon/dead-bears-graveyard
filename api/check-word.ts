import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---
// ALL YOUR SECRETS ARE NOW ON THE SERVER
// No one can see these arrays anymore.
// ---
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

// ---
// ALL YOUR REWARD LOGIC IS NOW ON THE SERVER
// ---
const generateCode = (type: 'OG' | 'WL') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RITUAL-${timestamp}-${random}`;
};

const determineReward = (): 'OG' | 'WL' => {
  const rand = Math.random() * 100;
  if (rand < 10) { // 10% chance for OG
    return 'OG';
  }
  return 'WL'; // 90% chance for WL
};

// This is the main API function that Vercel will run
export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  // ---
  // HANDLE 'GET' REQUEST (for fetching lore on page load)
  // ---
  if (req.method === 'GET') {
    try {
      // Pick a random lore fragment and send it
      const randomLore = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      return res.status(200).json({ lore: randomLore });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching lore' });
    }
  }

  // ---
  // HANDLE 'POST' REQUEST (for checking the secret word)
  // ---
  if (req.method === 'POST') {
    try {
      // 1. Get the word from the frontend's request
      const { word } = req.body;
      const trimmedInput = String(word || '').trim().toLowerCase();

      if (!trimmedInput) {
        return res.status(400).json({ success: false, message: 'No word provided.' });
      }

      // 2. Check the word against the SECRET list
      if (secretWords.includes(trimmedInput)) {
        // SUCCESS!
        // 3. Generate the reward on the server
        const rewardType = determineReward();
        const code = generateCode(rewardType);
        
        // 4. Send the reward back to the frontend
        return res.status(200).json({
          success: true,
          reward: {
            type: rewardType,
            code: code,
          },
        });

      } else {
        // FAILED
        // 5. Send a failure message back
        return res.status(400).json({ 
          success: false, 
          message: 'The void rejects your offering...' 
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error processing request' });
    }
  }

  // ---
  // Handle other methods (like PUT, DELETE, etc.)
  // ---
  return res.status(405).json({ message: 'Method Not Allowed' });
}