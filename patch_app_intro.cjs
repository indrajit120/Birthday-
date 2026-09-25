const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importIntro = `import GiftIntro from './components/GiftIntro';\nimport TopUI from './components/TopUI';`;
code = code.replace("import TopUI from './components/TopUI';", importIntro);

const stateIntro = `  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);`;
code = code.replace("  const [isPlaying, setIsPlaying] = useState(false);", stateIntro);

// Modify handleFirstInteraction to be called on gift open
const handleGiftOpen = `
  const handleGiftOpen = () => {
    setIsGiftOpened(true);
    // Try to start music when the gift opens
    if (!isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => console.warn("Audio play blocked on interaction", e));
      } else {
        setIsPlaying(true);
      }
    }
  };
`;

code = code.replace("  const handleFirstInteraction = () => {", handleGiftOpen + "\n  const handleFirstInteraction = () => {");

// Now we conditionally render the main app or the gift intro
const giftIntroComponent = `
      <AnimatePresence>
        {!isGiftOpened && (
          <GiftIntro 
            key="gift-intro" 
            onOpen={handleGiftOpen} 
            recipientName={config.name || 'You'} 
          />
        )}
      </AnimatePresence>
      <audio ref={audioRef} src={config.song} loop />
`;

code = code.replace("<audio ref={audioRef} src={config.song} loop />", giftIntroComponent);

fs.writeFileSync('src/App.tsx', code);
