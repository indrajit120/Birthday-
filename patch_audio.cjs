const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const audioEffect = `  const [hasAttemptedAutoplay, setHasAttemptedAutoplay] = useState(false);

  useEffect(() => {
    if (config?.song && audioRef.current && !hasAttemptedAutoplay) {
      setHasAttemptedAutoplay(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => console.warn("Autoplay blocked, waiting for user interaction.", e));
      }
    }
  }, [config?.song, hasAttemptedAutoplay]);`;

// Insert the new effect after the document.title effect
code = code.replace(
  '  }, [config?.name, config?.shareSettings?.title, interpolate]);',
  `  }, [config?.name, config?.shareSettings?.title, interpolate]);\n\n${audioEffect}`
);

// Replace handleFirstInteraction
const oldInteraction = `  const handleFirstInteraction = () => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.warn("Audio play blocked", e));
      setIsPlaying(true);
    }
  };`;

const newInteraction = `  const handleFirstInteraction = () => {
    if (!isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => console.warn("Audio play blocked on interaction", e));
      } else {
        setIsPlaying(true);
      }
    }
  };`;

code = code.replace(oldInteraction, newInteraction);

fs.writeFileSync('src/App.tsx', code);
