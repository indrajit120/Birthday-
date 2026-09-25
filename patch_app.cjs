const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "<TopUI isPlaying={isPlaying} toggleMusic={toggleMusic} stage={sceneIndex + 1} setStage={handleBack} />",
  "<TopUI isPlaying={isPlaying} toggleMusic={toggleMusic} stage={sceneIndex + 1} setStage={handleBack} currentSceneName={currentSceneName} />"
);

fs.writeFileSync('src/App.tsx', code);
