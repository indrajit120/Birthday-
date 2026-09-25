const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Extract the audio starting logic into handleInteractionStart
const logicToAdd = `
  const handleInteractionStart = () => {
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

  const handleGiftOpen = () => {
    setIsGiftOpened(true);
  };
`;

code = code.replace(
  /  const handleGiftOpen = \(\) => \{\s*setIsGiftOpened\(true\);\s*\/\/ Try to start music when the gift opens\s*if \(\!isPlaying && audioRef\.current\) \{\s*const playPromise = audioRef\.current\.play\(\);\s*if \(playPromise !== undefined\) \{\s*playPromise\s*\.then\(\(\) => setIsPlaying\(true\)\)\s*\.catch\(e => console\.warn\("Audio play blocked on interaction", e\)\);\s*\} else \{\s*setIsPlaying\(true\);\s*\}\s*\}\s*\};\n/,
  logicToAdd
);

// Update GiftIntro props
code = code.replace(
  "<GiftIntro \n            key=\"gift-intro\" \n            onOpen={handleGiftOpen} \n            recipientName={config.name || 'You'} \n          />",
  "<GiftIntro \n            key=\"gift-intro\" \n            onOpen={handleGiftOpen} \n            onInteractionStart={handleInteractionStart}\n            recipientName={config.name || 'You'} \n          />"
);

fs.writeFileSync('src/App.tsx', code);
